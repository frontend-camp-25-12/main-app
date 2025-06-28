import { createRouter } from 'vue-router'
import { createMemoryHistory } from 'vue-router'
import PluginList from '../views/PluginHomePageView/PluginList/Index.vue'
import PluginDetailView from '../views/PluginHomePageView/PluginDetail/Index.vue'

const routes = [
  {
    path: '/',
    name: 'PluginList',
    component: PluginList
  },
  {
    path: '/plugin-detail/:pluginId',
    name: 'PluginDetail',
    component: PluginDetailView,
    props: true
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
