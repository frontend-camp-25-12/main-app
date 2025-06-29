<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { ElButton, ElDivider, ElRow, ElCol, ElSelect, ElOption } from 'element-plus';
import ColorPicker from '../../components/ColorPicker.vue';
import BackgroundUploader from '../../components/BackgroundUploader.vue';
import { 
  t, 
  getLocale, 
  setLocale 
} from '../../utils/i18n';
import { 
  SUPPORTED_THEMES, 
  SUPPORTED_LANGUAGES 
} from '../../utils/constants';
import { 
  getTheme, 
  setTheme 
} from '../../utils/theme';
import { 
  getSkin, 
  setSkin, 
  getCustomColor 
} from '../../utils/skin';

const currentLanguage = ref(getLocale());
const currentTheme = ref(getTheme());
const currentSkin = ref(getSkin());
const customColor = ref(getCustomColor());
const tab = ref('theme'); // 默认选中“主题”
const pendingSkin = ref(currentSkin.value);
const pendingCustomColor = ref(customColor.value);
const backgroundImage = ref(localStorage.getItem('app_bg') || '');
const pendingBackgroundImage = ref(backgroundImage.value);

const handleLanguageChange = (lang: string) => {
  setLocale(lang);
};

const handleThemeChange = async (theme: string) => {
  await window.ipcApi.setColorMode(theme as 'light' | 'dark' | 'system');
  currentTheme.value = theme;
};

const handleSkinChange = (skin: string) => {
  if (skin.startsWith('#')) {
    window.ipcApi.appConfigSet('skin', 'custom');
    window.ipcApi.appConfigSet('customColor', skin);
  } else {
    window.ipcApi.appConfigSet('skin', skin);
  }
  currentSkin.value = skin;
};

const handleCustomColor = (color: string) => {
  customColor.value = color;
  setSkin('custom', color);
  currentSkin.value = getSkin();
};

onMounted(() => {
  // 不再设置 body 背景
  // const bg = localStorage.getItem('app_bg');
  // if (bg) {
  //   document.body.style.backgroundImage = `url(${bg})`;
  //   document.body.style.backgroundSize = 'cover';
  //   document.body.style.backgroundRepeat = 'no-repeat';
  // }
});

watch(tab, (val) => {
  if (val === 'skin') {
    pendingSkin.value = currentSkin.value;
    pendingCustomColor.value = customColor.value;
  }
});

// 占位方法，实际实现请根据你的业务逻辑补充
const initApp = () => window.location.reload();
const showAbout = () => alert(t('about'));

// 例如在 settings/App.vue 的 methods 里
async function handleToggleColorMode() {
  const mode = await window.ipcApi.toggleColorMode();
  // 这里不用再手动加 dark class，window.matchMedia 会自动通知
}

const applySkin = async () => {
  if (pendingSkin.value.startsWith('#')) {
    await window.ipcApi.appConfigSet('skin', 'custom');
    await window.ipcApi.appConfigSet('customColor', pendingSkin.value);
    customColor.value = pendingSkin.value;
    pendingCustomColor.value = pendingSkin.value;
    setSkin('custom', pendingSkin.value);
  } else {
    await window.ipcApi.appConfigSet('skin', pendingSkin.value);
    setSkin(pendingSkin.value);
  }
  currentSkin.value = pendingSkin.value;
};

function applyBackground() {
  backgroundImage.value = pendingBackgroundImage.value;
  localStorage.setItem('app_bg', backgroundImage.value);
}

const settingsLayoutStyle = computed(() => {
  if (backgroundImage.value) {
    return {
      backgroundImage: `url(${backgroundImage.value})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    };
  }
  return {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e8ee 100%)'
  };
});
</script>

<template>
  <div
    class="settings-layout"
    :style="settingsLayoutStyle"
  >
    <div v-if="backgroundImage" class="bg-mask"></div>
    <aside class="settings-sidebar">
      <ul>
        <li :class="{active: tab==='theme'}" @click="tab='theme'">
          <button class="sidebar-btn" :class="{selected: tab==='theme'}">{{ t('theme') }}</button>
        </li>
        <li :class="{active: tab==='language'}" @click="tab='language'">
          <button class="sidebar-btn" :class="{selected: tab==='language'}">{{ t('language') }}</button>
        </li>
        <li :class="{active: tab==='skin'}" @click="tab='skin'">
          <button class="sidebar-btn" :class="{selected: tab==='skin'}">{{ t('skin') }}</button>
        </li>
        <li :class="{active: tab==='background'}" @click="tab='background'">
          <button class="sidebar-btn" :class="{selected: tab==='background'}">{{ t('background') }}</button>
        </li>
      </ul>
    </aside>
    <main class="settings-main">
      <section v-if="tab==='theme'">
        <h2>{{ t('theme') }}</h2>
        <ElDivider />
        <ElRow :gutter="20" class="setting-row">
          <ElCol :span="6" class="label">{{ t('theme') }}</ElCol>
          <ElCol :span="18">
            <ElSelect v-model="currentTheme" @change="handleThemeChange">
              <ElOption 
                v-for="theme in SUPPORTED_THEMES" 
                :key="theme" 
                :label="t(theme)" 
                :value="theme"
              />
            </ElSelect>
          </ElCol>
        </ElRow>
      </section>
      <section v-if="tab==='language'">
        <h2>{{ t('language') }}</h2>
        <ElDivider />
        <ElRow :gutter="20" class="setting-row">
          <ElCol :span="6" class="label">{{ t('language') }}</ElCol>
          <ElCol :span="18">
            <ElSelect v-model="currentLanguage" @change="handleLanguageChange">
              <ElOption 
                v-for="lang in SUPPORTED_LANGUAGES" 
                :key="lang" 
                :label="lang === 'en' ? t('english') : t('chinese')" 
                :value="lang"
              />
            </ElSelect>
          </ElCol>
        </ElRow>
      </section>
      <section v-if="tab==='skin'">
        <h2>{{ t('skin') }}</h2>
        <ElDivider />
        <ElRow :gutter="20" class="setting-row">
          <ElCol :span="6" class="label">{{ t('skin') }}</ElCol>
          <ElCol :span="18">
            <ColorPicker 
              v-model="pendingSkin" 
              :custom-color="pendingCustomColor"
              @custom-color="val => pendingCustomColor.value = val"
            />
            <ElButton 
              type="primary" 
              style="margin-top: 18px"
              @click="applySkin"
            >{{ t('confirm') || '确认' }}</ElButton>
          </ElCol>
        </ElRow>
      </section>
      <section v-if="tab==='background'">
        <h2>{{ t('background') }}</h2>
        <ElDivider />
        <BackgroundUploader v-model="pendingBackgroundImage" />
        <ElButton type="primary" @click="applyBackground">{{ t('applyBackground') }}</ElButton>
      </section>
    </main>
  </div>
</template>

<style scoped>
.bg-mask {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: rgba(255,255,255,0.50); /* 浅白色，可调整蒙版的透明度 */
  pointer-events: none;
  border-radius: 18px;
}
.settings-layout {
  position: relative; /* 新增，确保蒙版绝对定位于容器内 */
  display: flex;
  min-height: 80vh;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #e3e8ee 100%); */ /* 删除或注释此行 */
  border-radius: 18px;
  box-shadow: 0 6px 32px 0 rgba(60, 60, 100, 0.10);
  max-width: 900px;
  margin: 48px auto;
  overflow: hidden;
}
.settings-sidebar {
  width: 180px;
  background: var(--settings-card-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1.5px solid var(--border-color);
  position: relative;
  z-index: 2; /* 保证内容在蒙版之上 */
}
.settings-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.settings-sidebar li {
  width: 100%;
  display: flex;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
}
.sidebar-btn {
  width: 90%;
  padding: 12px 0;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  background: var(--settings-card-bg);
  color: var(--text-color);
  font-size: 1.08rem;
  font-weight: 500;
  cursor: pointer;
  transition: 
    background 0.18s, 
    color 0.18s, 
    border-color 0.18s, 
    box-shadow 0.18s;
  outline: none;
  margin: 0 auto;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 100, 0.04);
}
.sidebar-btn.selected,
.sidebar-btn:hover,
.settings-sidebar li.active .sidebar-btn {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--accent-color);
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.10);
}
.settings-main {
  flex: 1;
  padding: 48px 36px;
  /*background: var(--settings-card-bg);*/
  background: transparent;
  min-height: 400px;
  position: relative;
  z-index: 2; /* 保证内容在蒙版之上 */
}
.settings-main h2 {
  color: var(--title-color);
  margin-bottom: 24px;
  font-size: 1.4rem;
  font-weight: 700;
}
.el-divider__text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  background: transparent;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.setting-row {
  margin-bottom: 18px;
  align-items: center;
  display: flex;
}
.label {
  flex: 0 0 90px;
  text-align: left;
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
  letter-spacing: 0.5px;
}
.setting-row .el-col {
  padding: 0;
}
.actions-row {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
.el-button {
  border-radius: 8px !important;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 100, 0.07);
  transition: box-shadow 0.2s;
}
.el-button--primary {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.10);
}
.el-button:hover {
  box-shadow: 0 6px 18px 0 rgba(64, 158, 255, 0.13);
}
@media (max-width: 700px) {
  .settings-layout {
    flex-direction: column;
    max-width: 98vw;
    margin: 0;
    border-radius: 0;
  }
  .settings-sidebar {
    flex-direction: row;
    width: 100%;
    border-right: none;
    border-bottom: 1.5px solid var(--border-color);
  }
  .settings-sidebar li {
    padding: 12px 0;
    font-size: 1rem;
  }
  .settings-main {
    padding: 24px 8px;
  }
}
</style>