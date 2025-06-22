import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import '../shared.css'
import '../../styles/theme.css' // 引入主题变量
import '../../styles/light.css' // 引入浅色主题覆盖
import '../../styles/dark.css'  // 引入深色主题覆盖
import App from './App.vue'
import i18n from '../../plugins/i18n'
import { initTheme } from '../../plugins/theme'

initTheme(); // 初始化主题

const app = createApp(App)

app.use(i18n)

app.mount('#app')
