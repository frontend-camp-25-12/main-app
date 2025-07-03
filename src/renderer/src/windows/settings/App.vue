<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { ElButton, ElSelect, ElOption, ElColorPicker, ElRow, ElCol, ElSwitch, ElSlider } from 'element-plus';
import { t, setLocale, getLocale } from '../../utils/i18n';
import { AppConfigSchema } from '../../../../share/plugins/type';
import { setThemeColor, themeColorDefault } from '../../utils/themeColor';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';

const customColor = ref<string>('');
const backgroundImage = ref<string>('');

const localeLabel = {
  en: 'English',
  "zh-CN": '中文',
}
const selectedLocale = ref<string>(localeLabel[getLocale()]);

const handleLocaleChange = (lang: AppConfigSchema['locale']) => {
  setLocale(lang);
  selectedLocale.value = localeLabel[lang] || lang;
};

const colorModeLabel = ref<string>('');
const colorModeOptions = computed(() => ({
  light: t('settings.colorModeLabel.light'),
  dark: t('settings.colorModeLabel.dark'),
  system: t('settings.colorModeLabel.system'),
}));
watch(() => getLocale(), async (newLocale) => {
  colorModeLabel.value = colorModeOptions.value[await window.ipcApi.getColorMode()] || '';
}, { immediate: true });

// 色彩模式切换
const handleColorModeChange = (theme: AppConfigSchema['colorMode']) => {
  window.ipcApi.setColorMode(theme);
};


// 自定义主题色处理
const handleColorChange = (color: string | null) => {
  setThemeColor(color || '');
};

// 背景图片
const fileInputRef = ref<HTMLInputElement>();
const backgroundOpacity = ref<number>(1);

const handleBackgroundUpload = () => {
  fileInputRef.value?.click();
};

const handleBackgroundFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    const path = window.getPathForFile(file);
    backgroundImage.value = await window.ipcApi.entranceBackgroundFile(path) ?? '';
  } else {
    await window.ipcApi.entranceBackgroundFile('')
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// 清除背景图片
const clearBackground = () => {
  window.ipcApi.entranceBackgroundFile('');
  backgroundImage.value = '';
};

const handleBackgroundOpacityChange = () => {
  window.ipcApi.entranceBackgroundImageOpacity(backgroundOpacity.value);
};

// 悬浮球开关处理
const enableFloatButton = ref<boolean>(false);
const handleFloatButtonChange = () => {
  window.ipcApi.floatingButtonToggle();
};

// 失去焦点后关闭命令窗口
const enableCloseOnBlur = ref<boolean>(false);
const handleCloseOnBlurChange = () => {
  window.ipcApi.entranceCloseOnBlur(enableCloseOnBlur.value);
};


onMounted(async () => {
  customColor.value = await window.ipcApi.appConfigGet('themeColor', '');
  enableFloatButton.value = await window.ipcApi.appConfigGet('floatWindow', true);
  backgroundImage.value = await window.ipcApi.entranceBackgroundFile(undefined) ?? '';
  backgroundOpacity.value = await window.ipcApi.entranceBackgroundImageOpacity(undefined) ?? 1;
  enableCloseOnBlur.value = await window.ipcApi.entranceCloseOnBlur(undefined) ?? false;
});
</script>

<template>
  <div class="settings-container" height="100%">
    <!-- 语言设置 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="8">
          <span class="setting-label">{{ t('settings.language') }}</span>
        </ElCol>
        <ElCol :span="10" :offset="6">
          <ElSelect v-model="selectedLocale" @change="handleLocaleChange">
            <ElOption v-for="(label, lang) in localeLabel" :key="lang" :label="label" :value="lang" />
          </ElSelect>
        </ElCol>
      </ElRow>
    </section>

    <!-- 主题设置 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="8">
          <span class="setting-label">{{ t('settings.colorMode') }}</span>
        </ElCol>
        <ElCol :span="10" :offset="6">
          <ElSelect v-model="colorModeLabel" @change="handleColorModeChange">
            <ElOption v-for="(label, theme) in colorModeOptions" :key="theme" :label="label" :value="theme" />
          </ElSelect>
        </ElCol>
      </ElRow>
    </section>

    <!-- 颜色设置 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="8">
          <span class="setting-label">{{ t('settings.themeColor') }}</span>
        </ElCol>
        <ElCol :span="customColor == themeColorDefault ? 10 : 6" :offset="6">
          <el-config-provider :locale="getLocale() === 'zh-CN' ? zhCn : en">
            <ElColorPicker v-model="customColor" @change="handleColorChange" show-alpha />
          </el-config-provider>
        </ElCol>
        <ElCol v-if="customColor != themeColorDefault" :span="3">
          <ElButton @click="customColor = themeColorDefault, handleColorChange(themeColorDefault)" plain>
            {{ t('settings.resetThemeColor') }}
          </ElButton>
        </ElCol>
      </ElRow>
    </section>

    <!-- 背景设置 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="8">
          <span class="setting-label">{{ t('settings.background') }}</span>
        </ElCol>
        <ElCol :span="6" :offset="6">
          <div class="background-controls">
            <input ref="fileInputRef" type="file" accept="image/*" @change="handleBackgroundFileChange"
              style="display: none;" />
            <ElButton type="primary" @click="handleBackgroundUpload">
              {{ t('settings.selectBackground') }}
            </ElButton>
          </div>
        </ElCol>
        <ElCol :span="3">
          <ElButton v-if="backgroundImage" @click="clearBackground" plain>
            {{ t('settings.clearBackground') }}
          </ElButton>
        </ElCol>
      </ElRow>
      <ElRow :gutter="4">
        <ElCol :span="20" :offset="4">
          <div v-if="backgroundImage" class="background-preview" :style="{ opacity: backgroundOpacity }">
            <img :src="backgroundImage" alt="Background Preview" />
          </div>
          <div v-if="backgroundImage">
            <span class="setting-label">{{ t('settings.backgroundOpacity') }}</span>
            <ElSlider :step="0.01" v-model="backgroundOpacity" :min="0" :max="1"
              @change="handleBackgroundOpacityChange" />
          </div>
        </ElCol>
      </ElRow>
    </section>

    <!-- 悬浮球设置 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="8">
          <span class="setting-label">{{ t('settings.floatButton') }}</span>
        </ElCol>
        <ElCol :span="16">
          <div style="float: right;">
            <ElSwitch v-model="enableFloatButton" @change="handleFloatButtonChange" />
          </div>
        </ElCol>
      </ElRow>
    </section>

    <!-- 命令窗口失去焦点后关闭 -->
    <section class="setting-section">
      <ElRow :gutter="4">
        <ElCol :span="16">
          <span class="setting-label">{{ t('settings.closeEntranceWindowOnBlur') }}</span>
        </ElCol>
        <ElCol :span="8">
          <div style="float: right;">
            <ElSwitch v-model="enableCloseOnBlur" @change="handleCloseOnBlurChange" />
          </div>
        </ElCol>
      </ElRow>
    </section>

  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
  margin: 0 auto;
  overflow-x: hidden;

  :deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
  }
}

.settings-card h2 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.setting-section h3 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-regular);
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 8px;
}

.setting-label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.background-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.background-preview {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
}

.background-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.el-select {
  width: 100%;
}
</style>