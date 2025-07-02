# 主程序

其它插件的入口、设置页、悬浮球

## 运行
开发，带HMR（此时无法加载本地图片资源）
```bash
npm run dev
```
预览（可以查看本地图片资源）
```bash
npm run start
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
2. 主程序的其它地方直接使用：
```ts
import { AppConfig } from 'src/main/config/app'
const config = AppConfig.get('newThing'); // 获取配置项，自带类型提示
```
3. 在渲染进程中使用：
```ts
window.ipcApi.appConfigGet('key', 'default')
window.ipcApi.appConfigSet('key', 'value')
```
对于存在额外操作的配置项，建议编写专用的ipc接口和服务，由服务来更新配置，而不是直接使用`appConfigSet`。
但是对于仅需要简单保存起来的配置项，就直接用这个接口吧。

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

4. **运行构建**
   运行 `npm run start` 或 `npm run dev`，触发构建以生成新的IPC接口代码。

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

## 在主应用中开发平台API
平台API在主应用的实现原理跟README里面提到的`ipc-generator`相同，在`src\main\plugins\ipc-service-plugin.ts`内设计接口，自动生成主进程的处理器和渲染进程的调用接口。
对于希望相关的类型定义，需要在`src\share\plugins\api.type.d.ts`中定义公共类型，它会被一并自动导出到类型声明中。
在仓库中`src\preload\generated\ipc-api-plugin.ts`的变更将会触发github actions，在`plugin-api-types`仓库中自动拉取并构建最新的dts，使得插件开发者可以获取到。

### 平台API列表

在 https://github.com/frontend-camp-25-12/plugin-api-types 中提供了类型定义的npm包，可通过
```bash
npm install git+https://github.com/frontend-camp-25-12/plugin-api-types
npm update @types/plugin-api-types
```
来安装和更新。
通过
```typescript
import { PluginApi } from '@types/plugin-api-types';
```
来导入类型定义。
详见其仓库readme。

| 方法名                | 说明                                   | 参数                                                         |
|---------------------|--------------------------------------|------------------------------------------------------------|
| hello               | 打印一条来自插件的问候信息到主进程控制台         | content: string                                 |
| onPluginEnter       | 注册插件进入事件的回调   | callback: (action: { code: string; payload: string }) => void |
| getLastPluginEnterAction | 获取上一次插件进入事件的action，可用于处理没有及时监听导致错过action的情况。 |  |
| configGet    | 获取指定配置项的值，如果不存在则返回默认值。         | key: 配置项名称<br>default: 默认值         |
| configSet    | 设置指定配置项的值。注意：读写时的key可以是'foo.bar'这样多级的json路径                             | key: 配置项名称<br>value: 要设置的值       |
| onOpenHotkeySettings | 打开快捷键设置窗口，并高亮显示指定功能的快捷键设置 | 希望用户设置快捷键的feature的code |
| closeSelf | 主动退出当前插件窗口 |  |
| getLocalePreference | 获得当前偏好语言（"en", "zh-CN"） |  |
| onLocalePreferenceChange | 注册语言变更事件的回调 | callback: (language: string) => void |

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
  // 插件的唯一标识符，必填。建议采用反向域名格式，例如 "com.yourname.pluginname"。
  "id": "your.plugin.id",

  // 插件的名称，必填。将显示在插件列表和搜索结果中。
  "name": "插件名称",

  // (可选) 插件的描述信息，用于详细说明插件的功能。
  "description": "这是一个很棒的插件，它能做...",

  // 插件的版本号，必填。必须严格遵循 SemVer (语义化版本) 规范，例如 "1.0.0", "2.1.3-beta.1"。
  "version": "1.0.0",

  // (可选) 插件的 logo 图片路径，相对于插件根目录。推荐使用 png 或 jpg。
  // 如果使用 svg，可能会导致窗口图标无法正常显示。
  "logo": "logo.png",

  // (可选) 插件的 preload 脚本路径，相对于插件根目录。
  // 默认为 "preload.js"。
  "preload": "preload.js",

  // (可选) 插件的内容网页路径 (GUI)，相对于插件根目录。
  // 默认为 "index.html"。
  "content": "index.html",

  // (可选) 是否为后台插件。默认为 false。
  // 如果为 true，则插件窗口关闭后，preload 脚本仍会保持运行，适用于需要持续执行任务的插件。
  "background": false,

  // (可选) 国际化配置，用于提供多语言的插件名称和描述。
  // 目前支持的语言代码为 "en" (英文) 和 "zh-CN" (简体中文)。
  "i18n": {
    "en": {
      "name": "Plugin Name",
      "description": "This is an awesome plugin that can do..."
    },
    "zh-CN": { // 如果你在之前配置的name和description中使用了中文，它们已经作为默认值了，不需要重复编写zh-CN版本。
      "name": "插件名称",
      "description": "这是一个很棒的插件，它能做..."
    }
  },

  // (可选) 自定义窗口配置。
  "window": {
    // (可选) 窗口初始宽度。
    "width": 800,
    // (可选) 窗口初始高度。
    "height": 600,
    // (可选) 是否禁用窗口打开和关闭时的过渡动画。默认为 false。
    "disableTransition": false,
    // (可选) 是否显示窗口边框和标题栏。默认为 true。
    "frame": true,
    // (可选) 是否启用透明窗口。默认为 false。
    // 注意：启用时必须同时设置 "frame": false 才有效。
    "transparent": false,
    // (可选) 是否允许用户调整窗口大小。默认为 true。
    "resizable": true,
    // (可选) 窗口是否总在所有其他窗口之上。默认为 false。
    "alwaysOnTop": false,
    // (可选) 窗口是否在失去焦点时自动关闭。默认为 false。
    "closeOnBlur": false,
    // (可选) 是否在操作系统的任务栏中隐藏窗口图标 (在 Windows 和 Linux 下有效)。默认为 false。
    "skipTaskbar": false,
    // (可选) 是否允许窗口获得焦点。默认为 true。
    // 对于透明窗口，设置为 false 可以避免在窗口上方显示灰色的标题栏背景。
    "focusable": true,
  },

  // (可选) 定义插件提供的具体功能列表，默认为空数组 []。
  // 即使用户不定义 features，插件依然可以通过其 "name" 和 "description" 被搜索到。
  "features": [
    {
      // 功能的唯一代码，必填。用于在代码 (如 onPluginEnter) 中识别用户从哪个功能入口进入插件。
      // 如果用户是通过点击插件主入口进入，则此 feature 不会被匹配。
      "code": "feature_translate",
      
      // 功能的显示名称，必填。此名称会参与命令检索，支持拼音和拼音首字母搜索。
      "label": "翻译文本",

      // (可选) 是否可为此功能设置全局快捷键。默认为 false。
      // 设置为 true 后，用户可在“快捷键管理”中为其分配一个快捷键。
      "hotKey": false,

      // (可选) 此功能是否可以被搜索到。默认为 true。
      // 如果设置为 false，并与 "hotKey": true 结合，可以创建只能通过快捷键访问的隐藏功能。
      "searchable": true,

      // (可选) 国际化配置，用于提供多语言的功能名称。
      "i18n": {
        "en": {
          "label": "Translate Text"
        },
        "zh-CN": {
          "label": "翻译文本"
        }
      },
      
      // 触发此功能的命令列表，必填。支持三种类型的命令。
      "cmds": [
        // 1. 字符串命令：用户输入完全匹配 "翻译" 或 "translate" 时触发。
        "翻译",
        "translate",

        // 2. 正则表达式命令：匹配一个或多个数字。
        {
          "type": "regex", // 类型固定为 "regex"
          // 正则匹配字符串，无需添加两边的斜杠 `/` 和 flag 标志。默认 flag 为 "gi"。
          // 例如，输入 "123" 会匹配，payload 为 "123"。
          "match": "\\d+"
        },

        // 3. 任意匹配命令：匹配任何非空输入。
        // 这通常应放在 cmds 列表的末尾，因为它会捕获所有之前未匹配的输入。
        {
          "type": "any" // 类型固定为 "any"
        }
      ]
    },
    {
      "code": "feature_ocr",
      "label": "屏幕截图OCR",
      "hotKey": true, // 示例：一个可以通过快捷键触发的功能
      "searchable": false, // 示例：一个无法被搜索到，只能通过快捷键触发的功能
      "i18n": {
        "en": { "label": "Screenshot OCR" },
        "zh-CN": { "label": "屏幕截图OCR" }
      },
      "cmds": [] // 此功能没有命令词，只能通过快捷键或其他方式（如其他插件调用）进入
    }
  ],
}
```