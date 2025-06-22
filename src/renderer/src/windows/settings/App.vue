<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElButton, ElSelect, ElOption, ElRow, ElCol, ElCard } from 'element-plus';
import { t, setLocale, getLocale } from '../../plugins/i18n';
import { SUPPORTED_LANGUAGES } from '../../plugins/constants';

const lang = ref(getLocale());

watch(lang, (val) => {
  setLocale(val);
});

onMounted(() => {
  lang.value = getLocale();
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
              v-for="lang in SUPPORTED_LANGUAGES" 
              :key="lang" 
              :label="lang === 'en' ? t('english') : t('chinese')" 
              :value="lang"
            />
          </ElSelect>
        </ElCol>
      </ElRow>
      
      <ElRow :gutter="20" class="setting-row">
        <ElCol :span="6" class="label">{{ t('theme') }}</ElCol>
        <ElCol :span="18">
          <ElSelect :model-value="t('system')" disabled>
            <ElOption :label="t('light')" value="light" />
            <ElOption :label="t('dark')" value="dark" />
            <ElOption :label="t('system')" value="system" />
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
