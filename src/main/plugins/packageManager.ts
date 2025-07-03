import { app } from "electron";
import path, { join } from "path";
import originalFs from 'original-fs'
import asar from 'asar';
import { pluginManager } from "./loader";
import { PluginPackageStorePersist } from "../config/pluginPackage";
import { ipcEmit } from "../generated/ipc-handlers-main";
import { BuiltinPluginId } from "./builtin";
import { pluginDownloadClient } from "../api";
import { PluginMetadata } from "../../share/plugins/type";
import { compareVersions } from 'compare-versions';


export interface PluginPackage {
  id: string; // 插件包的唯一标识符
  type: 'asar' | 'dir'; // 插件包的类型
  path: string; // 插件包的路径
  version: string; // 插件包的版本号，可选
  pendingDelete?: boolean; // 是否待删除
}

/**
 * 通过尝试获取asar包的头部信息来判断一个目录是否为asar包
 */
function isAsar(dirent: originalFs.Dirent | string) {
  try {
    let dirPath: string
    if (typeof dirent === 'string') {
      dirPath = dirent
    } else {
      dirPath = join(dirent.parentPath, dirent.name)
    }
    asar.getRawHeader(dirPath)
    return true
  } catch (error) {
    return false
  }
}


const pluginInstallPath = join(app.getPath('userData'), 'plugins')
const pluginDownloadPath = join(app.getPath('temp'), 'plugin-downloads')

/**
 * 插件包管理器
 * 处理插件文件的安装和卸载
 */
class PluginPackageManager {
  constructor() {
    this.loadPackages();
  }

  /**
   * 初始化：加载安装目录中的插件包
   * 并与有记录的插件包对比，如果有记录的插件包在安装目录中不存在，则删除记录。
   * 如果是未记录的插件包，则进行安装。
   * 如果是待删除的插件包，则进行删除。
   */
  private async loadPackages() {
    if (!originalFs.existsSync(pluginInstallPath)) {
      originalFs.mkdirSync(pluginInstallPath, { recursive: true })
    }
    const dirs = await originalFs.promises.readdir(pluginInstallPath, {
      withFileTypes: true
    })
    const storedPackages = PluginPackageStorePersist.get();
    const orphanPackage = new Map<string, PluginPackage>();
    for (const pkg of storedPackages) {
      orphanPackage.set(pkg.path, pkg);
    }
    const newPackages: string[] = [];
    for (const dirent of dirs) {
      if (dirent.isDirectory() || dirent.isSymbolicLink() || dirent.name.endsWith('.asar')) {
        const fullPath = join(pluginInstallPath, dirent.name);
        if (orphanPackage.has(fullPath)) {
          const pkg = orphanPackage.get(fullPath);
          if (pkg?.pendingDelete) {
            try {
              originalFs.rmSync(fullPath, { recursive: true, force: true });
            } catch (error) {
              // 文件被占用删除失败，不清除其记录，留待下次启动时再处理
              orphanPackage.delete(fullPath);
              console.error(`Failed to remove plugin directory ${fullPath}:`, error);
            }
          } else {
            orphanPackage.delete(fullPath);
          }
        } else {
          newPackages.push(dirent.name);
        }
      }
    }
    PluginPackageStorePersist.set(storedPackages.filter(pkg => !orphanPackage.has(pkg.path)));
    for (const basename of newPackages) {
      this.install(basename)
    }
  }

  /**
   * 列出已安装插件
   * @returns 插件路径[]
   */
  async list(): Promise<string[]> {
    return PluginPackageStorePersist.get().map(pkg => pkg.path);
  }

  /**
   * 安装插件文件夹内的插件。
   * @param basename 插件文件夹的名称
   * @param pluginDef 插件元数据
   */
  async install(basename: string, pluginDef?: PluginMetadata | null) {
    const installPath = join(pluginInstallPath, basename);
    if (!originalFs.existsSync(installPath)) {
      console.error(`Plugin directory ${installPath} does not exist`);
      throw new Error(`目录 ${installPath} 不存在`);
    }

    if (!pluginDef) {
      pluginDef = await pluginManager.readPluginMetadata(installPath);
      if (!pluginDef) {
        console.error(`Plugin metadata not found in ${installPath}`);
        throw new Error(`插件元数据未找到: ${installPath}`);
      }
    }

    const existingPkgs = PluginPackageStorePersist.get();
    // 为了处理更新和重新安装，需要找出安装记录中相同id的且版本最大的插件。
    const sameIdPkg = existingPkgs.filter(pkg => pkg.id === pluginDef.id)
      .sort((a, b) => compareVersions(b.version, a.version))[0];

    let isDowngrade = false;
    if (sameIdPkg) {
      const compareResult = compareVersions(pluginDef.version, sameIdPkg.version);
      if (compareResult === 1) {
        // 表明是更新
        await this.uninstall(sameIdPkg.id, sameIdPkg.version); // 卸载旧版本
      } else if (compareResult === -1) {
        // 低版本，接下来直接标记为待删除
        isDowngrade = true;
      } else {
        // 重新安装同版本插件，删除旧安装管理记录
        existingPkgs.splice(existingPkgs.indexOf(sameIdPkg), 1);
      }
    }

    let type: PluginPackage['type'] = isAsar(installPath) ? 'asar' : 'dir';
    // 持久化记录安装信息
    const newPkg: PluginPackage = {
      id: pluginDef.id,
      type: type,
      path: installPath,
      version: pluginDef.version
    }
    if (!isDowngrade) {
      pluginManager.install(installPath, pluginDef);
    } else {
      newPkg.pendingDelete = true; // 标记为待删除
    }
    PluginPackageStorePersist.set([...existingPkgs, newPkg]);
    return newPkg;
  }

  /**
   * 安装不在插件文件夹内的插件文件。目标是将外部插件目录或asar文件复制到应用的插件目录中。
   * 如果插件已存在，则代表已安装，什么都不做。
   * @param dir 插件目录或asar文件路径
   */
  async installExternal(dir: string): Promise<PluginPackage | undefined> {
    if (!path.isAbsolute(dir)) {
      dir = join(process.cwd(), dir)
    }

    if (!originalFs.existsSync(dir)) {
      console.error(`Plugin directory ${dir} does not exist`)
      throw new Error(`目录 ${dir} 不存在`)
    }

    const basename = path.basename(dir)
    const installPath = join(pluginInstallPath, basename)

    if (originalFs.existsSync(installPath)) {
      const pkgList = PluginPackageStorePersist.get()
      const pkg = pkgList.find(pkg => pkg.path === installPath);
      if (pkg) {
        if (pkg.pendingDelete) {
          pkg.pendingDelete = false;
          PluginPackageStorePersist.set(pkgList);
          return this.install(basename);
        }
      }
    } else {
      const pluginDef = await pluginManager.readPluginMetadata(dir);
      if (!pluginDef) {
        console.error(`Plugin metadata not found in ${dir}`);
        throw new Error(`插件元数据未找到: ${dir}`);
      }
      if (isAsar(dir)) {
        originalFs.copyFileSync(dir, installPath);
      } else {
        // 软链接开发中的插件文件夹
        await originalFs.promises.symlink(dir, installPath, 'dir')
      }
      return this.install(basename, pluginDef)
    }
    return undefined;
  }

  /**
   * 卸载插件。将其标记为待清理。下次启动时会删除。
   * @param id 插件ID
   */
  async uninstall(id: string, version: string) {
    const pkgs = PluginPackageStorePersist.get();
    const target = PluginPackageStorePersist.find(id, version);
    if (!target) {
      console.warn(`Plugin ${id} not found in installed packages.`);
      console.warn(`current installed packages:`, pkgs);
      return;
    }
    target.pendingDelete = true; // 标记为待删除
    PluginPackageStorePersist.set(pkgs);
    return pluginManager.remove(id); // 从插件管理器中移除。需要返回给调用方来确保时序
  }
  /**
   * 下载插件后安装
   * @param id 插件标识
   */
  async fetchAndInstall(id: string) {
    try {
      const response = await pluginDownloadClient.get(`${id}`, {
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            // 发送进度到渲染进程
            ipcEmit.pluginDownloadProgressTo(BuiltinPluginId.PLUGINSTORE, percent, id);
          }
        }
      });

      // 读取 Content-Disposition 头部中的文件名
      let filename: string = `${id}.zip`;
      const disposition = response.headers['content-disposition'];
      if (disposition) {
        const match = /filename="?([^"]+)"?/.exec(disposition);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      if (!originalFs.existsSync(pluginDownloadPath)) {
        originalFs.mkdirSync(pluginDownloadPath, { recursive: true });
      }
      const filePath = join(pluginDownloadPath, filename);
      const file = originalFs.createWriteStream(filePath);

      // 将响应流写入文件
      response.data.pipe(file);

      return new Promise<void>((resolve, reject) => {
        file.on('finish', async () => {
          file.close();
          ipcEmit.pluginDownloadProgressTo(BuiltinPluginId.PLUGINSTORE, 100, id);
          try {
            await this.installExternal(filePath);
            resolve();
          } catch (installError) {
            reject(installError);
          }
        });

        file.on('error', (error) => {
          console.error(`Error writing plugin file ${id}:`, error);
          reject(error);
        });

        response.data.on('error', (error) => {
          console.error(`Error downloading plugin ${id}:`, error);
          reject(error);
        });
      });
    } catch (error) {
      console.error(`Error downloading plugin ${id}:`, error);
      throw error;
    }
  }
}

export const pluginPackageManager = new PluginPackageManager();

