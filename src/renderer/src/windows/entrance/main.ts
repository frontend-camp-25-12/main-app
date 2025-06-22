import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import '../shared.css'
import '../../styles/theme.css' // 引入主题变量
import '../../styles/light.css' // 引入浅色主题覆盖
import '../../styles/dark.css'  // 引入深色主题覆盖
import App from './App.vue'
import i18n, { setLocale } from '../../plugins/i18n'
import { initTheme, setTheme } from '../../plugins/theme'
import { initSkin, setSkin } from '../../plugins/skin' // 导入皮肤模块

initTheme(); // 初始化主题
initSkin();  // 初始化皮肤

// 新增：监听设置变更
if (window.electron) {
  window.electron.ipcRenderer.on('settings-changed', (_event, payload) => {
    if (payload.type === 'theme') {
      setTheme(payload.value, true); // 标记为IPC广播
    } else if (payload.type === 'skin') {
      setSkin(payload.value, payload.color, true);
    } else if (payload.type === 'language') {
      setLocale(payload.value, true);
    }
  });
}

const app = createApp(App)

app.use(i18n)
app.mount('#app')
