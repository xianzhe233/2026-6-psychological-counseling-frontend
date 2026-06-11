<script setup lang="ts">
import { NButton, NPopconfirm } from 'naive-ui'
import type { ButtonProps } from 'naive-ui'

const props = withDefaults(
  defineProps<{
    confirmText?: string
    positiveText?: string
    negativeText?: string
    type?: ButtonProps['type']
    size?: ButtonProps['size']
    disabled?: boolean
    loading?: boolean
    quaternary?: boolean
    text?: boolean
    block?: boolean
  }>(),
  {
    confirmText: '确定执行该操作吗？',
    positiveText: '确定',
    negativeText: '取消',
    type: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    quaternary: false,
    text: false,
    block: false,
  },
)

const emit = defineEmits<{
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <n-popconfirm @positive-click="handleConfirm">
    <template #trigger>
      <n-button
        :type="type"
        :size="size"
        :disabled="disabled"
        :loading="loading"
        :quaternary="quaternary"
        :text="text"
        :block="block"
      >
        <slot />
      </n-button>
    </template>
    <template #default>
      <slot name="confirm">
        {{ confirmText }}
      </slot>
    </template>
  </n-popconfirm>
</template>
