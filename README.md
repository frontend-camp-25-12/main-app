# 主程序

其它插件的入口、设置页、悬浮球

## 运行
开发，带HMR
```bash
npm run dev
```
打包
```bash
npm run build
```


## 主程序约定使用
- 渲染进程：Vue 3 Composition + vue-router
- UI 组件：Element Plus（利用它的i18n与深浅色模式支持）
- 窗口配置：`contextIsolation: false`，`sandbox: false`

## 目录结构
```shell
demo-plugin/          # 示例插件
src/                  # 源码目录
  main/               # 主进程相关代码
    plugins/          # 插件管理与内置插件
  preload/            # 预加载脚本
  renderer/           # 渲染进程
    src/              # 前端源码
      windows/        # 各窗口页面
        entrance/     # 入口窗口
        settings/     # 设置窗口
  share/              # 主/渲染进程共享类型与工具
    plugins/          # 插件相关类型定义
```

## 添加新窗口

当前把应用内的窗口也视为插件，方便管理和加载。

1. 在 `src/renderer/windows/<窗口名>/index.html` 创建 `index.html`（和`main.ts` `App.vue` 等文件，如果需要使用vue）
2. 在 `src/main/plugins/builtin.ts`中添加窗口（也是一个插件）的元数据：（其它跟普通插件共享的字段见文末）
   ```ts
   {
     id: 'builtin.mywindow',
     name: 'MyWindow',
     dist: '<窗口名>',  // 和 windws/<窗口名> 对应
     internal: {       // 标记这是一个内置窗口
        hidden: true  // （可选）在插件列表中隐藏这个窗口
     }
   }
   ```
3. 需要时通过插件机制打开窗口：
   ```ts
   await pluginManager.open('builtin.mywindow')
   ```

## 窗口跳转
使用 `pluginManager.open(id)` 在主进程中加载并显示对应窗口，实现不同页面间的切换。

## 应用设置的方案
- 持久化方案？
- 主进程与渲染进程如何状态同步？

## ipc开发

为了简化electron添加ipc接口的重复劳动，减少人工错误，项目内添加了`build/ipc-generator`这个`vite`插件，通过扫描 `src/main/ipc-service-main.ts` 和 `src/main/ipc-server-plugin.ts` 中定义的服务类方法，自动生成主进程的 IPC 处理器代码和渲染进程的调用接口代码。

#### 过程
1. **服务类方法读取**：
   - 约定在 `src/main/ipc-service-main.ts` 中定义服务接口，方法以 `on` 或 `emit` 开头，具体说明见`src/main/ipc-service-main.ts`。
   - 插件会自动提取每个方法的返回类型和参数类型。
2. **公共类型提取**：
   - 约定在 `src/share/**/type.d.ts` 中定义任何需要在main和renderer进程共享的ts类型。
   - 这些类型会被在生成的代码中引用，来使得类型检查和提示生效。
3. **主进程接口生成**：
   - 在 `src/main/generated/ipc-handlers-main.ts` 中生成 `ipcMain.handle` 的接口注册代码。
4. **渲染进程接口生成**：
   - 在 `src/preload/generated/ipc-api-main.ts` 中生成 `ipcRenderer.invoke` 的调用代码。
   - 渲染进程可以通过 `ipcApi` 对象直接调用主进程方法，享受类型提示。

#### 添加新接口的步骤
以下以 `SearchResult` 类型为例，演示如何添加一个新接口：

1. **定义公共类型**
   在 `src/share/plugins/type.d.ts` 中定义类型。例如：
   ```typescript
   export interface SearchResult {
     id: string;
     name?: MatchRange;
     description?: MatchRange;
     feature: {
       code: string;
       matchedCmdLabel: string[];
     }[];
     score: number;
   }
   ```

2. **在服务类中定义方法**
   打开 `src/main/ipc-service.ts`，在服务类中添加以 `on` 开头的方法。例如：
   ```typescript
   export class IpcService {
     // ...现有方法...

     /**
      * 搜索插件
      * @param query 搜索关键词
      * @returns 搜索结果列表
      */
      async onPluginSearch(query: string): Promise<SearchResult[]> {
        return pluginSearch.search(query);
      }
   }
   ```

3. **在渲染进程中调用接口**
   在renderer代码中，通过 `window.ipcApi` 调用新接口。例如：
   ```typescript

   async function searchPlugin(query: string) {
     const results = await window.ipcApi.pluginSearch(query);
   }
   ```

通过以上步骤，即可完成一个新ipc接口的定义和使用。


# 插件开发

当前定义：插件是**任意**提供了 `plugin.json` `preload.js` `index.html` 的目录，相当于于electron中一个renderer。
目录中
- `index.html`是插件被激活时的窗口显示的内容。
- `preload.js`是插件的预加载脚本，等同于electron的`preload.js`，要求为CommonJS模块。
- `plugin.json`是插件的元数据，包含插件的ID、名称、版本等信息。

## 插件生命周期
![](https://mermaid.ink/img/pako:eNqFVMtO20AU_RVrELsQ2XHsJG6FBMRmValS6aZOF248ebSOHTl2gSKkCAHBpCK0VCBBqaAPlXYBVR_QJDx-xjMOf9HxIwFRqnph-dw599x7z5VnDuQNFQIBFDRjOl9STIuayuZ0ijzDwxQ63HbbDt47QaetMJjXlFotCwuUXYOm-BzqFlUoa5owJPJSSpJiNcs0nkFhiEln6AEcmS6rVklIVGfu3FCpKGV9gjQQiUiSlBL5gYg0lp5g-P-KmFBXoXldhpckMTuQ4RITSWbsNpnBoL3VBW-hHY4bBh_KuPXa7R6j9g_U-uYdNFGnhdaP0OrBY0EQBtOH5DFGRkdtt7OGnTp-66CT74TqvTnwthdDldtyEjI6raPWq159CTtNItw7O0NLn8IEvNnwi39s35I5LmPnc2__JVU1oWYoavxpzWf1vQxJWZnUxysn_liNbjTLzjnea9x9Yo7ilc3w2O2u9c43_LL7y5d1Bze__LNhUTb0-5pdLOuibkGTcjvNoMVFb3357_pS5J_3dQu1PqCVHdTt-KyrZYW8SRmt7pHJqTKJz8RLVkW7Sbva0sU7r3MR7YcaGRklxvcXEMDxvrXX0TgBJLXhdpbd33V8-AtvHV9u_fRtCD3AzgbZBDkOO77cfY93LwKF6E_IBkCMbAiAFE0ZgMmcDmKgAk1igUr-pTn_MAesEqzAHBDIpwoLiq1ZOZDT5wlVsS3jwayeB4Jl2jAGTMMulvrArqqKBbNlpWgqFSAUFK1GolVFf2QYlT6paPqVouzIK1u3gJDm2IAMhDkwAwSWp-MZlkvQGY5hU6lkho-BWSDwbJxnk2maSdBskubSzHwMvAjk6TjHc4kUneFpliVvlokBqJYtw7wXXhTBfdHvUgxOoibn_wD6vbpc?type=png)

注：
- onPluginEnter是在preload.js中利用平台API注册的事件，**当前未实现平台API**


## 约束
1. 插件即是一个独立的electron renderer，但是相对于Electron默认的安全策略，有如下调整
    - `contextIsolation: false`
      关闭上下文隔离，preload脚本可以直接通过window向index.html挂载所需要的Electron API或其它对象。
      虽然牺牲了安全上的最佳实践，但是相比开启隔离，关闭后向`mainWorld`暴露的API就不限制于可被完美序列化的对象，不用担心序列化导致外部模块的API出问题。
    - `sandbox: false`
      关闭沙盒模式，插件可以直接使用Node.js API。

    这么做有个另外的理由：<del>utools也干了</del>
    所以它把安全压力转移到“插件商店的审核”上，要求preload.js不加密、不混淆。    

2. 插件的`preload.js`必须是`CommonJS`模块，不能使用ESM。
    可通过`tsconfig.json`配置为`"moduleResolution": "node"`来确保。    
    `electron`的`preload.js`虽然支持ESM，但是有额外的[注意事项](https://www.electronjs.org/docs/latest/tutorial/esm)。所以还是让在Node.js中运行的`preload.js`使用`CommonJS`风味吧。

## 插件的`plugin.json`定义
（将会保持更新，随时根据需要调整）
```json
{
  "id": "your.plugin.id",                // 插件唯一标识符
  "name": "插件名称",                     // 插件名称
  "description": "插件描述",              // （可选）插件描述
  "version": "1.0.0",                    // 插件版本
  "logo": "./logo.png",                    // （可选）插件图标，路径相对于插件目录
  "window": {                              // （可选）窗口配置
    "width": 800,                          // （可选）窗口宽度
    "height": 600,                         // （可选）窗口高度
    "disableTransition": false,            // （可选）禁用窗口动画
    "frame": true,                         // （可选）是否显示窗口边框，默认true
    "transparent": false,                  // （可选）是否透明窗口，默认false，设为true时需要同时设置`frame: false`才有效
    "resizable": true                      // （可选）是否允许调整窗口大小，默认true
  },
  "features": [                            // （可选）插件功能定义，未定义时，插件也可以通过名称和描述来被检索进入
    {
      "code": "featureCode",              // 功能代码，用于在onPluginEnter时，区分不同功能
      "cmds": [                            // 可触发这个feature的命令列表
        "search",                        // 定义一个命令叫search
        {                                    // 也可以定义正则匹配的命令
          "type": "regex",                // 对于正则匹配命令，固定为'regex'
          "label": "命令显示名",           // 匹配成功后命令的显示名称
          "match": "\\d+"                // 正则匹配字符串（不含/和flag）
        },{
          "type": "any",                // 也可以定义匹配任意输入的命令
          "label": "匹配任意输入的命令"    
        }
      ]
    }
  ]
}
```