<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { ElSlider } from 'element-plus';

// ---------------- 背景与蒙版逻辑整理 ----------------
// 皮肤色（skin color）逻辑
const skinColor = ref(localStorage.getItem('skin_color') || '#ff7c40');

function updateSkinColor() {
  skinColor.value = localStorage.getItem('skin_color') || '#ff7c40';
}
// 背景图片 base64/url，和白色蒙版透明度（0-100），均由 settings 页面设置并通过 localStorage + ipcApi 同步
const backgroundImage = ref(localStorage.getItem('app_bg') || '');
const maskOpacity = ref(Number(localStorage.getItem('app_bg_mask_opacity') || 60)); // 0-100

// 响应式追踪深色/浅色模式
const isDark = ref(document.documentElement.classList.contains('dark'));
function updateIsDark() {
  isDark.value = document.documentElement.classList.contains('dark');
}

// 计算主窗口背景样式：
// 1. 有图片时显示图片
// 2. 无图片时根据主题色显示纯白（浅色）或纯黑（深色）
const bgStyle = computed(() => {
  return {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    background: backgroundImage.value
      ? `url(${backgroundImage.value}) center/cover no-repeat`
      : (isDark.value ? '#000000' : '#ffffff'),
  };
});

// 计算白色蒙版样式：
// 1. 有图片时显示白色蒙版，透明度由 maskOpacity 控制
// 2. 无图片时不显示蒙版（即透明度为0，display:none）
const maskStyle = computed(() => {
  if (!backgroundImage.value) return { display: 'none' };
  return {
    background: `rgba(255,255,255,${maskOpacity.value / 100})`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  };
});
// ---------------------------------------------------
import { ref, onMounted, Ref, useTemplateRef } from 'vue';
import { ElButton, ElInput, ElNotification, ElScrollbar } from 'element-plus';
import { PluginEnterAction, PluginMetadata } from '../../../../share/plugins/type';
import { t } from '../../utils/i18n';
import GridPlugin from './components/GridPlugin.vue';
import ListPlugin from './components/ListPlugin.vue';
import { PluginView } from './utils/plugin';
import { Grid, Expand } from '@element-plus/icons-vue';

let pluginList: PluginMetadata[] = [];
const pluginPath = ref('');
const searchInput = ref('');
const cmdInput = useTemplateRef<InstanceType<typeof ElInput>>('cmd-input');;

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


onMounted(() => {
  fetchPlugins();
  window.ipcApi.appConfigGet('entrance_viewMode', 'list').then(mode => {
    viewMode.value = mode || 'list';
  });
  window.ipcApi.onPluginListChange(() => {
    fetchPlugins();
  })
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key == 'Tab' || (event.ctrlKey || event.metaKey || event.shiftKey)) {
      return;
    }
    if (event.key === 'Escape') {
      window.platform.closeSelf();
      return;
    }
    if (cmdInput.value && document.activeElement !== cmdInput.value.$el) {
      cmdInput.value.focus();
    }
  });

  // 监听 localStorage 变化和主进程配置变更，实现多窗口同步
  window.addEventListener('storage', (e) => {
    updateBgConfig();
    if (e.key === 'skin_color') updateSkinColor();
  });
  // 新增：监听自定义皮肤色变更事件，保证同窗口内实时生效
  window.addEventListener('skin_color_change', updateSkinColor);

  window.ipcApi?.onUiConfigChange?.((key, value) => {
    if (key === 'app_bg') backgroundImage.value = value || '';
    if (key === 'app_bg_mask_opacity') maskOpacity.value = Number(value) || 60;
    if (key === 'skin_color') skinColor.value = value || '#ff7c40';
  });

  // 监听 html 的 class 变化，响应深浅色切换
  const observer = new MutationObserver(updateIsDark);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  // 组件卸载时断开监听
  onUnmounted(() => observer.disconnect());
});

onUnmounted(() => {
  window.removeEventListener('storage', updateBgConfig);
  window.removeEventListener('skin_color_change', updateSkinColor);
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
  searchInput.value = '';
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

// 统一的本地配置同步方法
function updateBgConfig() {
  backgroundImage.value = localStorage.getItem('app_bg') || '';
  maskOpacity.value = Number(localStorage.getItem('app_bg_mask_opacity') || 60);
  window.dispatchEvent(new Event('skin_color_change'));
}

// 皮肤色按钮字体自适应（浅色皮肤用深字，深色皮肤用白字）
function getContrastYIQ(hex: string) {
  let color = hex.replace('#', '');
  if (color.length === 3) color = color.split('').map(x => x + x).join('');
  const r = parseInt(color.substr(0,2),16);
  const g = parseInt(color.substr(2,2),16);
  const b = parseInt(color.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return yiq >= 180 ? '#222' : '#fff';
}
</script>

<template>
  <div style="position:relative; min-height:100vh;">
    <!-- 背景层 -->
    <div :style="bgStyle"></div>
    <div :style="maskStyle"></div>
    <!-- 透明度调节器已移除，主页面不显示滑钮 -->
    <!-- 主内容 -->
    <div class="plugin-container" style="position:relative;z-index:3;">
      <div style="display: flex; gap: 8px;">
      <ElInput v-model="pluginPath" :placeholder="t('entrance.pluginPathPlaceholder')" @keyup.enter="handleAddPlugin"
        style="flex: 1" tabindex="-1"/>
<ElButton
  type="primary"
  :disabled="!pluginPath.trim()"
  @click="handleAddPlugin"
  tabindex="-1"
  class="add-plugin-btn"
  :style="{
    backgroundColor: skinColor,
    borderColor: skinColor,
    color: getContrastYIQ(skinColor)
  }"
>
  {{ t('entrance.addPlugin') }}
</ElButton>
    </div>
      <div style="display: flex; gap: 8px;">
      <ElInput v-model="searchInput" class="cmd-input" :placeholder="t('entrance.searchPlaceholder')"
        @input="handleSearchInput" @keyup.enter="openFirstItem" size="large" ref="cmd-input" tabindex="-1"/>
      <ElButton tabindex="-1" @click="switchViewMode" :icon="viewMode === 'grid' ? Grid : Expand" circle size="large"
        style="font-size: 18px;">
      </ElButton>
    </div>

<span class="plugin-category" v-if="searchInput.length" :style="{ color: skinColor }">{{ t('entrance.commandMatch') }}</span>
<span class="plugin-category" v-else :style="{ color: skinColor, fontWeight: 'bold' }">{{ t('entrance.recentlyUsed') }}</span>
      <ElScrollbar class="plugin-grid-container">
        <GridPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-if="viewMode === 'grid'" />
        <ListPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-else />
      </ElScrollbar>
    </div>
  </div>
</template>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: transparent; /* 保证主内容区无背景色 */
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
</style>