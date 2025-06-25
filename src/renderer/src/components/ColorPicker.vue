<template>
  <div class="color-picker">
    <div class="preset-colors">
      <!-- 只保留自定义按钮 -->
      <div 
        class="color-option custom"
        :class="{ active: selectedSkin === 'custom' }"
        @click="showCustomPicker = true"
      >
        <i class="el-icon-plus"></i>
      </div>
    </div>
    
    <div class="custom-picker" v-if="showCustomPicker">
      <div class="custom-header">
        <span>自定义颜色</span>
        <i class="el-icon-close" @click="showCustomPicker = false"></i>
      </div>
      <input 
        type="color" 
        v-model="customColor" 
        @input="selectCustomColor"
      />
      <input 
        type="text" 
        v-model="customColor" 
        placeholder="#HEX"
        class="hex-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue', 'custom-color']);

const selectedSkin = ref<string>(props.modelValue || 'custom');
const customColor = ref<string>('');
const showCustomPicker = ref<boolean>(false);

watch(() => props.modelValue, (newVal) => {
  selectedSkin.value = newVal || 'custom';
});

const selectCustomColor = () => {
  if (customColor.value) {
    selectedSkin.value = 'custom';
    emit('update:modelValue', customColor.value); // 传递颜色值
    setTimeout(() => {
      emit('custom-color', customColor.value);
    }, 10);
  }
};
</script>

<style scoped>
.color-picker {
  position: relative;
}

.preset-colors {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--text-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.color-option i {
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.color-option.custom {
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
}

.color-option.custom i {
  color: #909399;
}

.custom-picker {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-color);
}

.custom-header i {
  cursor: pointer;
  font-size: 16px;
}

input[type="color"] {
  width: 100%;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.hex-input {
  width: 100%;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
}
</style>