import { PluginPackage } from "../../plugins/packageManager";
import { configFolder } from "../type.d";
import Store from 'electron-store';

interface PluginPackageSchema {
  packages: PluginPackage[];
}

const PluginPackageStore = new Store<PluginPackageSchema>({
  name: 'pluginPackage',
  cwd: configFolder
})

export class PluginPackageStorePersist {
  private static pkgs: PluginPackage[] | undefined = undefined;
  private static pathPkgMap: Map<string, PluginPackage> | undefined = undefined;
  static get() {
    if (!this.pkgs) {
      this.pkgs = PluginPackageStore.get('packages', []);
      this.pathPkgMap = new Map(this.pkgs.map(pkg => [pkg.path, pkg]));
    }
    return this.pkgs;
  }

  static find(id: string, version: string) {
    if (!this.pkgs) {
      this.get();
    }
    return this.pkgs!.find(pkg => pkg.id === id && pkg.version === version);
  }

  static get map() {
    if (!this.pathPkgMap) {
      this.get();
    }
    return this.pathPkgMap;
  }

  static set(packages: PluginPackage[]) {
    this.pkgs = packages;
    this.pathPkgMap = new Map(packages.map(pkg => [pkg.path, pkg]));
    PluginPackageStore.set('packages', packages);
  }
}