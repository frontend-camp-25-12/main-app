<script setup lang="ts">
import { ref } from 'vue';
import { PluginView } from '../utils/plugin';
import icon from '../../../../../../resources/icon/icon.png';
import { t } from '../../../utils/i18n';
import TextHighlight from './TextHighlight';
import usePluginNumber from './usePluginNumber';

const props = defineProps<{
  plugins: PluginView[]
}>()

const emit = defineEmits<{
  (e: 'open-plugin', id: string, feat: PluginView['feature']): void
}>();

const activeIndex = ref(-1);

const setActiveItem = (index: number) => {
  activeIndex.value = index;
};

const { showNumbers } = usePluginNumber(
  (id, feature) => emit('open-plugin', id, feature),
  props
);


</script>

<template>
  <div v-if="plugins.length" class="plugin-list">
    <div v-for="(plugin, index) in plugins" :key="plugin.id + plugin.feature?.code" class="plugin-item"
      :class="{ 'is-active': index === activeIndex }" tabindex="0" role="button"
      :aria-label="`${plugin.name}${plugin.feature ? ' - ' + plugin.feature.label : ''}`"
      @click="emit('open-plugin', plugin.id, plugin.feature)"
      @keydown.enter="emit('open-plugin', plugin.id, plugin.feature)"
      @keydown.space.prevent="emit('open-plugin', plugin.id, plugin.feature)" @focus="setActiveItem(index)"
      @mouseover="setActiveItem(index)">

      <div class="plugin-icon-container">
        <img width="32" :src="plugin.logoPath ? `${plugin.logoPath}` : icon" alt="logo" class="plugin-icon" />
        <div v-if="showNumbers" class="plugin-number">{{ index + 1 }}</div>
      </div>

      <div class="plugin-info">
        <div class="plugin-name">
          <TextHighlight v-if="plugin.feature" :text="plugin.feature.label" :ranges="plugin.feature.labelMatch" />
          <TextHighlight v-else :text="plugin.name" :ranges="plugin.matchedName" />
        </div>
        <div class="plugin-description" v-if="plugin.description">
          <TextHighlight :text="plugin.description" :ranges="plugin.matchedDescription" />
        </div>
      </div>

      <div class="plugin-right-name">
        {{ plugin.name }}
      </div>
    </div>
  </div>
  <div v-else style="color: var(--el-text-color-secondary); animation: fadeIn 0.2s ease; padding: 8px;">
    {{ t('entrance.noPlugins') }}
  </div>
</template>

<style scoped>
.plugin-list {
  padding: 8px;
  flex: 1 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.plugin-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: var(--el-border-radius-base);
  transition: background-color 0.2s ease;
  margin-bottom: 4px;
}

.plugin-item:hover,
.plugin-item:focus,
.plugin-item.is-active {
  background-color: var(--el-fill-color-light);
}

.plugin-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.plugin-info :deep(.highlight) {
  background-color: var(--el-color-success-light-7);
}

.plugin-name {
  color: var(--el-text-color-primary);
  font-weight: 500;
  font-size: 16px;
}

.plugin-description {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.plugin-right-name {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
