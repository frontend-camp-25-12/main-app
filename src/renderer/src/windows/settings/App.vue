<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElDivider, ElRow, ElCol, ElSelect, ElOption } from 'element-plus';
import ColorPicker from '../../components/ColorPicker.vue';
import { 
  t, 
  getLocale, 
  setLocale 
} from '../../plugins/i18n';
import { 
  SUPPORTED_THEMES, 
  SUPPORTED_LANGUAGES 
} from '../../plugins/constants';
import { 
  getTheme, 
  setTheme 
} from '../../plugins/theme';
import { 
  getSkin, 
  setSkin, 
  getCustomColor 
} from '../../plugins/skin';

const currentLanguage = ref(getLocale());
const currentTheme = ref(getTheme());
const currentSkin = ref(getSkin());
const customColor = ref(getCustomColor());
const tab = ref('appearance');

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
  <div class="settings-layout">
    <aside class="settings-sidebar">
      <ul>
        <li :class="{active: tab==='appearance'}" @click="tab='appearance'">{{ t('theme') }}</li>
        <li :class="{active: tab==='language'}" @click="tab='language'">{{ t('language') }}</li>
        <li :class="{active: tab==='actions'}" @click="tab='actions'">{{ t('actions') }}</li>
      </ul>
    </aside>
    <main class="settings-main">
      <section v-if="tab==='appearance'">
        <h2>{{ t('theme') }}</h2>
        
        <ElDivider content-position="left">{{ t('theme') }}</ElDivider>
        
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
      </section>
      <section v-if="tab==='language'">
        <h2>{{ t('language') }}</h2>
        
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
      </section>
      <section v-if="tab==='actions'">
        <h2>{{ t('actions') }}</h2>
        
        <ElDivider content-position="left">{{ t('actions') }}</ElDivider>
        
        <ElRow class="actions-row">
          <ElButton type="primary" @click="initApp">{{ t('refresh') }}</ElButton>
          <ElButton @click="showAbout">{{ t('about') }}</ElButton>
        </ElRow>
      </section>
    </main>
  </div>
</template>

<style scoped>
.settings-layout {
  display: flex;
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e3e8ee 100%);
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
}
.settings-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.settings-sidebar li {
  padding: 18px 0;
  width: 100%;
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border-left: 4px solid transparent;
}
.settings-sidebar li.active {
  color: #fff;
  background: var(--primary-color);
  border-left: 4px solid var(--primary-color);
  font-weight: bold;
  transition: background 0.2s, color 0.2s;
}
.settings-sidebar li:hover {
  background: var(--primary-color);
  color: #fff;
  transition: background 0.2s, color 0.2s;
}
.settings-main {
  flex: 1;
  padding: 48px 36px;
  background: var(--settings-card-bg);
  min-height: 400px;
}
.settings-main h2 {
  color: var(--primary-color);
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