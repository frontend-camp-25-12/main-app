import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './css/common.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
