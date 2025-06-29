<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import { ElButton, ElInput, ElNotification, ElScrollbar } from 'element-plus';
import { PluginEnterAction, PluginMetadata } from '../../../../share/plugins/type';
import { t } from '../../utils/i18n';
import GridPlugin from './components/GridPlugin.vue';
import ListPlugin from './components/ListPlugin.vue';
import { PluginView } from './utils/plugin';
import { Grid, Expand } from '@element-plus/icons-vue';
import { setTheme } from '../../utils/theme'
import { setLocale } from '../../utils/i18n'
import { setSkin, initSkin } from '../../utils/skin'

let pluginList: PluginMetadata[] = [];
const pluginPath = ref('');
const searchInput = ref('');

let displayedPlugins: Ref<PluginView[]> = ref([]);
const viewMode = ref<'grid' | 'list'>('list');

const fetchPlugins = async () => {
  const data = await window.ipcApi.pluginListRecent();
  pluginList = data || [];
  displayedPlugins.value = pluginList.filter(plugin => !plugin.internal?.hidden && !plugin.disabled).map(plugin => new PluginView(plugin));
};

const handleAddPlugin = async () => {
  if (!pluginPath.value.trim()) return;
  try {
    await window.ipcApi.pluginDevInstall(pluginPath.value.trim());
    pluginPath.value = '';
    await fetchPlugins();
    ElNotification.success({
      title: t('entrance.pluginAddSuccess'),
      message: t('entrance.pluginAddSuccess'),
      duration: 2000,
      position: 'bottom-right',
    });
  } catch (error: any) {
    ElNotification.error({
      title: t('entrance.pluginAddFailed'),
      message: error?.message || t('entrance.pluginAddFailed'),
      duration: 5000,
      position: 'bottom-right',
    });
  }
};

const handleSearchInput = async () => {
  const query = searchInput.value.trim();
  if (!query) {
    fetchPlugins();
    return;
  }
  const filteredPlugins = await window.ipcApi.pluginSearch(query);
  displayedPlugins.value = PluginView.fromSearchResult(pluginList, filteredPlugins)
};

function updateBodyBackground(theme: string, backgroundUrl?: string) {
  if (backgroundUrl) {
    document.body.style.backgroundImage = `url(${backgroundUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundColor = '';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = theme === 'dark' ? '#181818' : '#fff';
  }
}

let currentTheme = 'light';
let currentBackground = '';

onMounted(() => {
  initSkin();
  fetchPlugins();
  window.ipcApi.appConfigGet('entrance_viewMode', 'list').then(mode => {
    viewMode.value = mode || 'list';
  });
  // 主动读取一次背景
  window.ipcApi.appConfigGet('background', '').then(bg => {
    currentBackground = bg || '';
    updateBodyBackground(currentTheme, currentBackground);
  });
  if (window.electron) {
    window.electron.ipcRenderer.on('settings-changed', (_event, payload) => {
      if (payload.type === 'theme') {
        setTheme(payload.value, true);
        currentTheme = payload.value;
        updateBodyBackground(currentTheme, currentBackground);
      }
      if (payload.type === 'background') {
        currentBackground = payload.value || '';
        updateBodyBackground(currentTheme, currentBackground);
      }
      if (payload.type === 'skin') {
        if (payload.value === 'custom') {
          window.ipcApi.appConfigGet('customColor', '#c62424').then(color => {
            setSkin('custom', color, true);
          });
        } else {
          setSkin(payload.value, undefined, true);
        }
      }
      if (payload.type === 'customColor') {
        setSkin('custom', payload.value, true);
      }
      if (payload.type === 'language') setLocale(payload.value, true);
    });
  }
});

if (import.meta.env.DEV) {
  ElNotification({
    title: '当前是vite dev server环境',
    message: '插件的logo将无法正常加载显示，可通过使用npm run start启动部署环境的应用来解决。'
  })
}

function handleOpenPlugin(id: string, feat: PluginView['feature']) {
  const payload = searchInput.value
  let action: PluginEnterAction = {
    code: '',
    payload,
    from: payload ? 'cmd' : 'menu'
  };
  if (feat) {
    action.code = feat.code
  }
  window.ipcApi.pluginOpen(id, action);
  fetchPlugins();
};

function switchViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
  window.ipcApi.appConfigSet('entrance_viewMode', viewMode.value);
}

function openFirstItem() {
  if (displayedPlugins.value.length > 0) {
    const firstPlugin = displayedPlugins.value[0];
    handleOpenPlugin(firstPlugin.id, firstPlugin.feature);
  }
}
</script>

<template>
  <div class="plugin-container">
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="pluginPath" :placeholder="t('entrance.pluginPathPlaceholder')" @keyup.enter="handleAddPlugin"
        style="flex: 1" />
      <ElButton type="primary" :disabled="!pluginPath.trim()" @click="handleAddPlugin">
        {{ t('entrance.addPlugin') }}
      </ElButton>
    </div>
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="searchInput" class="cmd-input" :placeholder="t('entrance.searchPlaceholder')" @input="handleSearchInput"
        @keyup.enter="openFirstItem" size="large" />
      <ElButton tabindex="-1" @click="switchViewMode" :icon="viewMode === 'grid' ? Grid : Expand" circle size="large" style="font-size: 18px;">
      </ElButton>
    </div>

    <span class="plugin-category" v-if="searchInput.length">{{ t('entrance.commandMatch') }}</span>
    <span class="plugin-category" v-else>{{ t('entrance.recentlyUsed') }}</span>
    <ElScrollbar class="plugin-grid-container">
      <GridPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-if="viewMode === 'grid'" />
      <ListPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-else />
    </ElScrollbar>
  </div>
</template>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: transparent; /* 让内容区透明，显示body背景 */
  >*:not(.plugin-grid-container) {
    padding: 8px;
  }
}

.plugin-category {
  animation: fadeIn 0.2s ease;
}

.cmd-input {
  font-size: 20px;
}
</style>

<style>
/**
 * 如果你要实现主题换肤，查看node_modules/element-plus/dist/index.css
 * 前一百行挂在:root上的变量定义，其它组件的颜色都是引用的这些变量。
 * 然后再对应去覆盖，而不是自定义一堆变量然后再选择不同的组件类去覆盖，工作量无限增大而且代码很乱。
 *
 * 把按钮的颜色覆盖成橙色只需要在非scope style里写上：
 */
html {
  /* --el-color-primary: rgb(255, 124, 64) !important; */
  /* 因为disabled的按钮色是el-button-disabled-bg-color，
  而primary button的el-button-disabled-bg-color 
  指向 el-color-primary-light-5 ，所以修改它 */
  /* --el-color-primary-light-5: rgb(240, 174, 163) !important; */
}

html.dark {
  /**
   * 深色模式的主题色也可以对应覆盖
   */
  /* --el-color-primary: rgb(175, 55, 0) !important; */
  /* --el-color-primary-light-5: rgb(100, 56, 48) !important; */
}

/**
 * 为了换肤方便，让颜色动态变化，实际应该通过代码直接在html元素上用style覆盖这些变量。
 * （另一个想法是用v-bind in css，但是它的原理是在根template上加style标签，覆盖不到html元素上，不好做。）
 */
.el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #fff !important;
}
.el-button--primary:hover {
  background-color: var(--primary-dark-color) !important;
  border-color: var(--primary-dark-color) !important;
}
</style>