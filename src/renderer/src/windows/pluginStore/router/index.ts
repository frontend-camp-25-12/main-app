import { createRouter } from 'vue-router'
import { createMemoryHistory } from 'vue-router'
import PluginList from '../views/PluginHomePageView/PluginList/Index.vue'

const routes = [
  {
    path: '/',
    name: 'PluginList',
    component: PluginList
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
