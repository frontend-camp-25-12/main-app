<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElSelect, ElOption, ElRow, ElCol, ElCard } from 'element-plus';
import { t, setLocale, getLocale } from '../../plugins/i18n';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from '../../plugins/constants';
import { setTheme, getTheme } from '../../plugins/theme';

const lang = ref(getLocale());
const theme = ref(getTheme());

const handleLanguageChange = (val: string) => {
  setLocale(val);
};

const handleThemeChange = (val: string) => {
  setTheme(val as 'light' | 'dark' | 'system');
  theme.value = getTheme();
};

onMounted(() => {
  lang.value = getLocale();
  theme.value = getTheme();
});
</script>

<template>
  <div class="settings-container">
    <ElCard class="settings-card">
      <h1>{{ t('settings') }}</h1>
      
      <ElRow :gutter="20" class="setting-row">
        <ElCol :span="6" class="label">{{ t('language') }}</ElCol>
        <ElCol :span="18">
          <ElSelect v-model="lang" @change="handleLanguageChange">
            <ElOption 
              v-for="l in SUPPORTED_LANGUAGES" 
              :key="l" 
              :label="l === 'en' ? t('english') : t('chinese')" 
              :value="l"
            />
          </ElSelect>
        </ElCol>
      </ElRow>
      
      <ElRow :gutter="20" class="setting-row">
        <ElCol :span="6" class="label">{{ t('theme') }}</ElCol>
        <ElCol :span="18">
          <ElSelect v-model="theme" @change="handleThemeChange">
            <ElOption 
              v-for="th in SUPPORTED_THEMES" 
              :key="th" 
              :label="t(th)" 
              :value="th"
            />
          </ElSelect>
        </ElCol>
      </ElRow>
      
      <ElRow class="actions-row">
        <ElButton type="primary">{{ t('refresh') }}</ElButton>
        <ElButton>{{ t('about') }}</ElButton>
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
}

.setting-row {
  margin-bottom: 20px;
  align-items: center;
}

.label {
  text-align: right;
  padding-right: 10px;
  font-weight: bold;
}

.actions-row {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
