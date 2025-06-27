<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { ElInput } from 'element-plus'
import { t } from '../../../utils/i18n'

const emit = defineEmits<{
  (event: 'change', value: string): void
}>()

const props = defineProps<{
  initialValue?: string
}>()

const displayValue = ref('')
const isCapturing = ref(false)
const pressedKeys = ref(new Set<string>())
const inputRef = useTemplateRef<InstanceType<typeof ElInput>>('inputRef')

// 键位映射，将浏览器的 key 转换为 Electron Accelerator 格式
const keyMap: Record<string, string> = {
  'Control': 'CmdOrCtrl',
  'Meta': 'Cmd',
  'Alt': 'Alt',
  'Shift': 'Shift',
  'ArrowUp': 'Up',
  'ArrowDown': 'Down',
  'ArrowLeft': 'Left',
  'ArrowRight': 'Right',
  'Escape': 'Esc',
  'Delete': 'Delete',
  'Backspace': 'Backspace',
  'Enter': 'Return',
  'Tab': 'Tab',
  ' ': 'Space'
}

// 修饰键顺序
const modifierOrder = ['CmdOrCtrl', 'Cmd', 'Alt', 'Shift']

const startCapture = () => {
  isCapturing.value = true
  pressedKeys.value.clear()
  displayValue.value = t('hotkeyInput.pleaseInput')
}

const stopCapture = () => {
  if (!isCapturing.value) return

  isCapturing.value = false

  if (pressedKeys.value.size === 0) {
    displayValue.value = t('hotkeyInput.empty')
    emit('change', '')
    return
  }

  // 转换为 Electron Accelerator 格式
  const keys = Array.from(pressedKeys.value)
  const modifiers: string[] = []
  const normalKeys: string[] = []

  keys.forEach(key => {
    if (modifierOrder.includes(key)) {
      modifiers.push(key)
    } else {
      normalKeys.push(key)
    }
  })

  // 按照修饰键顺序排序
  modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))

  // 组合快捷键字符串
  const accelerator = [...modifiers, ...normalKeys].join('+')
  displayValue.value = accelerator

  emit('change', accelerator)
}

const handleKeyDown = (event: Event | KeyboardEvent) => {
  if (!isCapturing.value) return
  if (event instanceof KeyboardEvent === false) return

  event.preventDefault()
  event.stopPropagation()

  let key = event.key

  // 处理修饰键
  if (event.ctrlKey || event.metaKey) {
    if (event.ctrlKey) pressedKeys.value.add('CmdOrCtrl')
    if (event.metaKey) pressedKeys.value.add('Cmd')
  }
  if (event.altKey) pressedKeys.value.add('Alt')
  if (event.shiftKey) pressedKeys.value.add('Shift')

  // 处理普通键
  if (!['Control', 'Meta', 'Alt', 'Shift'].includes(key)) {
    // 映射特殊键
    if (keyMap[key]) {
      pressedKeys.value.add(keyMap[key])
    } else {
      // 普通字母数字键转为大写
      if (key.length === 1) {
        pressedKeys.value.add(key.toUpperCase())
      } else {
        pressedKeys.value.add(key)
      }
    }
  }

  // 实时显示当前按下的键
  const currentKeys = Array.from(pressedKeys.value)
  const modifiers: string[] = []
  const normalKeys: string[] = []

  currentKeys.forEach(k => {
    if (modifierOrder.includes(k)) {
      modifiers.push(k)
    } else {
      normalKeys.push(k)
    }
  })

  modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))
  displayValue.value = [...modifiers, ...normalKeys].join('+')
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (!isCapturing.value) return

  event.preventDefault()
  event.stopPropagation()

  inputRef.value?.blur()
}

watch(() => props.initialValue, (newValue) => {
  if (!newValue) {
    displayValue.value = t('hotkeyInput.empty')
    pressedKeys.value.clear()
    return
  }
  // 解析 Accelerator 字符串
  const parts = newValue.split('+').filter(Boolean)
  const modifiers: string[] = []
  const normalKeys: string[] = []
  parts.forEach(key => {
    if (modifierOrder.includes(key)) {
      modifiers.push(key)
    } else {
      normalKeys.push(key)
    }
  })
  modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))
  const formatted = [...modifiers, ...normalKeys].join('+')
  displayValue.value = formatted
  pressedKeys.value = new Set([...modifiers, ...normalKeys])
}, { immediate: true })

</script>

<template>
  <ElInput :value="displayValue" :placeholder="t('hotkeyInput.empty')" readonly @click="startCapture"
    @focus="startCapture" @blur="stopCapture" @keydown="handleKeyDown" @keyup="handleKeyUp" tabindex="-1" ref="inputRef"
    class="hotkey-input" />
</template>

<style scoped></style>