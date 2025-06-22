import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../shared.css'
import App from './App.vue'
import i18n from '../../utils/i18n'

const app = createApp(App)

app.use(i18n)
app.mount('#app')
