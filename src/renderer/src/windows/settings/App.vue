<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElSelect, ElOption, ElRow, ElCol, ElCard, ElDivider } from 'element-plus';
import { t, setLocale, getLocale } from '../../plugins/i18n';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from '../../plugins/constants';
import { setTheme, getTheme } from '../../plugins/theme';
import { setSkin, getSkin, getCustomColor } from '../../plugins/skin';
import ColorPicker from '../../components/ColorPicker.vue';

const currentLanguage = ref(getLocale());
const currentTheme = ref(getTheme());
const currentSkin = ref(getSkin());
const customColor = ref(getCustomColor());

const handleLanguageChange = (lang: string) => {
  setLocale(lang);
};

const handleThemeChange = (theme: string) => {
  setTheme(theme as 'light' | 'dark' | 'system');
  currentTheme.value = getTheme();
};

const handleSkinChange = (skin: string) => {
  if (skin === 'custom') {
    setSkin(skin, customColor.value);
  } else {
    setSkin(skin);
  }
  currentSkin.value = getSkin();
};

const handleCustomColor = (color: string) => {
  customColor.value = color;
  setSkin('custom', color);
  currentSkin.value = getSkin();
};

onMounted(() => {
  currentLanguage.value = getLocale();
  currentTheme.value = getTheme();
  currentSkin.value = getSkin();
  customColor.value = getCustomColor();
});

// 占位方法，实际实现请根据你的业务逻辑补充
const initApp = () => window.location.reload();
const showAbout = () => alert(t('about'));
</script>

<template>
  <div class="settings-container">
    <ElCard class="settings-card">
      <h1>{{ t('settings') }}</h1>
      
      <ElDivider content-position="left">{{ t('appearance') }}</ElDivider>
      
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
      
      <ElRow :gutter="20" class="setting-row">
        <ElCol :span="6" class="label">{{ t('skin') }}</ElCol>
        <ElCol :span="18">
          <ColorPicker 
            v-model="currentSkin" 
            :custom-color="customColor"
            @change="handleSkinChange"
            @custom-color="handleCustomColor"
          />
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">{{ t('language') }}</ElDivider>
      
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
      
      <ElDivider content-position="left">{{ t('actions') }}</ElDivider>
      
      <ElRow class="actions-row">
        <ElButton type="primary" @click="initApp">{{ t('refresh') }}</ElButton>
        <ElButton @click="showAbout">{{ t('about') }}</ElButton>
      </ElRow>
    </ElCard>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  padding: 20px;
  background-color: var(--settings-card-bg);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.setting-row {
  margin-bottom: 20px;
  align-items: center;
}

.label {
  text-align: right;
  padding-right: 10px;
  font-weight: bold;
  color: var(--text-color);
}

.actions-row {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-divider__text {
  background-color: var(--divider-bg);
  padding: 0 10px;
  color: var(--text-color);
}
</style>
