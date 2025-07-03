<script setup lang="ts">
import { PluginView } from '../utils/plugin';
import icon from '../../../../../../resources/icon/icon.png';
import { t } from '../../../utils/i18n';
import usePluginNumber from './usePluginNumber';

const props = defineProps<{
  plugins: PluginView[]
}>()

const emit = defineEmits<{
  (e: 'open-plugin', id: string, feat: PluginView['feature']): void
}>();

const { showNumbers } = usePluginNumber(
  (id, feature) => emit('open-plugin', id, feature),
  props
);
</script>

<template>
  <div v-if="plugins.length" class="plugin-grid">
    <template v-for="(plugin, index) in plugins" :key="plugin.id + plugin.feature?.code">
      <div class="plugin-item" tabindex="0" role="button"
        :aria-label="`${plugin.name}${plugin.feature ? ' - ' + plugin.feature.label : ''}`"
        @click="emit('open-plugin', plugin.id, plugin.feature)"
        @keydown.enter="emit('open-plugin', plugin.id, plugin.feature)"
        @keydown.space.prevent="emit('open-plugin', plugin.id, plugin.feature)">
        <div class="plugin-icon-container">
          <img width="48" :src="plugin.logoPath ? `${plugin.logoPath}` : icon" alt="logo" class="plugin-icon" />
          <div v-if="showNumbers" class="plugin-number">{{ index + 1 }}</div>
        </div>
        <ElText :line-clamp="2">{{ plugin.name }}</ElText>
        <div class="search-label" v-if="plugin.feature">
          {{ plugin.feature.label }}
        </div>
      </div>
    </template>
  </div>
  <div v-else style="color: var(--el-text-color-secondary); animation: fadeIn 0.2s ease; padding: 8px;">
    {{ t('entrance.noPlugins') }}
  </div>
</template>


<style scoped>
.plugin-grid {
  padding: 12px 6px;
  flex: 1 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.plugin-item {
  position: relative;
  height: 86px;
  cursor: pointer;
  padding: 12px 4px;
  border-radius: var(--el-border-radius-base);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .el-text {
    transition: color 0.2s ease;
  }
}

.plugin-item:hover,
.plugin-item:focus {
  box-shadow: 0 2px 8px var(--el-border-color-darker);

  .el-text {
    --el-text-color: var(--el-color-primary);
  }
}

.search-label {
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(round(-50%, 1px), round(-50%, 1px));
  border-radius: var(--el-border-radius-base);
  backdrop-filter: blur(4px);
  padding: 2px 4px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.1em;
  background-color: var(--el-color-primary-light-9);
}
</style>