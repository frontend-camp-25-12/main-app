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
- 持久化方案
使用`electron-store@8.2.0`来存储应用设置，配置项存储在%APPDATA%/config目录下的配置文件中。
对于主应用开发，可以按如下步骤添加新的配置项：
1. 在 `src/main/config/schema.ts` 中定义新的应用内配置项
```ts
export interface ConfigSchema {
  colorMode: "light" | "dark" | "system";
  locale: "en" | "zh-CN";
  newThing: "some" | "other"; // 新增配置项
}
```
2. 其它地方直接使用：
```ts
import { AppConfig } from 'src/main/config/service.ts'
const config = AppConfig.get('newThing'); // 获取配置项，自带类型提示
```

对于插件开发者，见下文的ipcApi部分，具体原理是每个插件拥有独立的配置文件，在config/plugins目录下，文件名为插件ID.json。

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
   打开 `src/main/ipc-service.ts`，在服务类中添加以 `on` 开头的方法，或者`emit`开头的方法。用`on`方法为例：
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
![](https://mermaid.ink/img/pako:eNqNVFtvEkEU_iubafpGCcOd1TRpC9tLYmKivgh9WNnhossuWRZtJSRNY0uhphBpxNjUXrxVja2x2hZoy5_ZGeDJv-BeBmiURvdpzjnffOec75ydHIjKAgIsiInyk2iCV1TmbjAiMfo3Osrgw9davUh2T_F52XJGRT6TCaIYk80gJfQYSSoTS4oiOxLycj6Os2VURX6E2BHoDzj65tiTpKAmWGd64cYfLCk-KU3pBVASjuN8IW-fhJvwT0HvP0kUJAlIuUrj5bhQsE_jcU654cQwmn6jndJye7lutWs574VJ-YXWPMH1Y1z-1j5Yx40yrhzh0sE8y7L97i3wBAzjo7rW2MCVDR1t3RyCmwyT4sfO3nMmrSBR5gX7w4yB6qlggYLh9uYBWTs1Cio0aRVbl2S3cPOBMk7WXlphrbnRuazilfdkb7W7VCTrn65NGwrL0m0xG09KIUlFCqM11g3Od8_aldW_83O08_bnGi6_xWtbuNkwUAOZLdx0GJd2OxcXTFL3L9gTakocBpvJXRXl1_lOnmoB_0eMGXjN9VmqknbR0g_tZpVs7xj64JXjbu3r1Q6GCDIXJmffyU6109rSJ9vZ_9ItlMjm5TyNwrDWXEkkBUQJBmvSetNutOiCMGNj4_rkextgmpO0N93QwQWtsaqdLZHDn6R20q39MOqzqibFKj5f0sNWod3tfbLdMhnozxc0jRkqgm6QV0eGJzTw4MoHMyXs6WleoRM3zxwdqGlM06mZxqxFDwfEc7An-IB6LiIBG0ghRZ-JoL8ROQMSAWoCpVAEsPpRQDE-K6oREJHyOpTPqvKdRSkKWFXJIhtQ5Gw80TOyaYFXUTDJxxU-BdgYL2Z0b5qX7styqgeKK0YmeptuUlZSAQsdHreJBmwOLADW5XDbPQ6X3-l3OaHX5YU2sAhYt8sOHdAV8DudDl_A6c_bwFOT3WH3QWfA7wj4PV43dPsCHhtAQlKVlVvW-2c-g70iQ2aE1pj_DXwrD28?type=png)

注：
- onPluginEnter是在preload.js中利用平台API注册的事件，**当前已经实现平台API**

## 平台API

平台API的接口代码位于`src\preload\generated\ipc-api-plugin.ts`，插件开发时，通过window.platfrom来访问平台api。例如仓库内附带的`demo-plugin`中的示例：
```javascript
window.platform.hello('world')
window.platform.onPluginEnter((action) => {
  window.alert(`插件进入事件触发: code:${action.code} payload:${action.payload}`);
});
                      // 嵌套的配置路径是允许的，将会生成类似{ "hello": { "world": "!!!" } }
window.platform.configSet('hello.world', '!!!!').then(async () => {
  alert('配置项 hello.world 设置为: ' + await window.platform.configGet('hello.world', 'default')); // 请确保给出default值
});
```

平台API在主应用的实现原理跟README里面提到的`ipc-generator`相同，在`src\main\plugins\ipc-service-plugin.ts`内设计接口，自动生成主进程的处理器和渲染进程的调用接口。
开发新的平台API时，注意避免包含外部的类型，因为生成的代码将外部类型复制进去后，无法resolve到对应类型。

### 平台API列表

后续计划自动生成ts类型声明供插件开发者导入

| 方法名                | 说明                                   | 参数                                                         |
|---------------------|--------------------------------------|------------------------------------------------------------|
| hello               | 打印一条来自插件的问候信息到主进程控制台         | content: string                                 |
| onPluginEnter       | 注册插件进入事件的回调   | callback: (action: { code: string; payload: string }) => void |
| configGet    | 获取指定配置项的值，如果不存在则返回默认值。         | key: 配置项名称<br>default: 默认值         |
| configSet    | 设置指定配置项的值。注意：读写时的key可以是'foo.bar'这样多级的json路径                             | key: 配置项名称<br>value: 要设置的值       |



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
  "background": false,                // （可选）是否需要保持后台运行，默认false
  "window": {                              // （可选）窗口配置
    "width": 800,                          // （可选）窗口宽度
    "height": 600,                         // （可选）窗口高度
    "disableTransition": false,            // （可选）禁用窗口动画
    "frame": true,                         // （可选）是否显示窗口边框，默认true
    "transparent": false,                  // （可选）是否透明窗口，默认false，设为true时需要同时设置`frame: false`才有效
    "resizable": true                      // （可选）是否允许调整窗口大小，默认true
  },
  "features": [                            // （可选）插件功能定义，未定义时，插件也可以通过名称和描述来被检索进入，支持拼音搜索和拼音首字母搜索
    {
      "code": "featureCode",              // 功能代码，用于在onPluginEnter时，区分不同功能
      "label": "功能名称",              // 功能名称
      "cmds": [                            // 可触发这个feature的命令列表, 一共支持三种类型的命令
        "search",                        // 定义一个命令叫search
        {                                    // 也可以定义正则匹配的命令
          "type": "regex",                // 对于正则匹配命令，固定为'regex'
          "match": "\\d+"                // 正则匹配字符串（不含/和flag）
        },{
          "type": "any",                // 也可以定义匹配任意输入的命令
        }
      ]
    }
  ]
}
```