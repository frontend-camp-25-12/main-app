<template>
  <div>
    <input type="file" accept="image/*" @change="onFileChange" />
    <div v-if="preview" class="preview">
      <img :src="preview" alt="背景预览" style="max-width: 100%;max-height: 120px;" />
      <el-button size="small" @click="clear">移除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(['update:modelValue']);

const preview = ref(props.modelValue);

watch(() => props.modelValue, val => preview.value = val);

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.value = reader.result as string;
    emit('update:modelValue', preview.value);
    // 可选：持久化到 localStorage 或调用 ipcApi 保存
    localStorage.setItem('app_bg', preview.value!);
  };
  reader.readAsDataURL(file);
}

function clear() {
  preview.value = '';
  emit('update:modelValue', '');
  localStorage.removeItem('app_bg');
}
</script>