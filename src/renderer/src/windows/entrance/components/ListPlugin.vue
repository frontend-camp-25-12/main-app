<script setup lang="ts">
import { ref, onMounted, onUnmounted, h, VNode } from 'vue';
import { PluginView } from '../utils/plugin';
import icon from '../../../../../../resources/icon.png';
import { t } from '../../../utils/i18n';
import TextHighlight from './TextHighlight';

const props = defineProps<{
  plugins: PluginView[]
}>()

const emit = defineEmits<{
  (e: 'open-plugin', id: string, feat: PluginView['feature']): void
}>();

const activeIndex = ref(-1);
const showNumbers = ref(false);


const setActiveItem = (index: number) => {
  activeIndex.value = index;
};

const handleAltKey = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    showNumbers.value = event.type === 'keydown';
  }
};


const handleNumberKey = (event: KeyboardEvent) => {
  if (!showNumbers.value) return;
  const num = parseInt(event.key);
  if (!isNaN(num) && num > 0 && num <= props.plugins.length) {
    const plugin = props.plugins[num - 1];
    emit('open-plugin', plugin.id, plugin.feature);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleAltKey);
  window.addEventListener('keyup', handleAltKey);
  window.addEventListener('keydown', handleNumberKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleAltKey);
  window.removeEventListener('keyup', handleAltKey);
  window.removeEventListener('keydown', handleNumberKey);
});


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

.plugin-icon-container {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.plugin-icon {
  border-radius: var(--el-border-radius-base);
}

.plugin-number {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
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
