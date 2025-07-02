import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './css/common.css'
import '../../utils/i18n'
import '../../utils/themeColor'
import '../../utils/uiChange'
import '../shared.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
