<script setup lang="ts">
import { NAlert, NIcon } from 'naive-ui'
import { WarningOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title?: string
    message: string
    type?: 'warning' | 'error' | 'info'
    closable?: boolean
  }>(),
  {
    title: '安排冲突',
    type: 'warning',
    closable: false,
  },
)

const visible = defineModel<boolean>('visible', { default: true })
</script>

<template>
  <n-alert
    v-if="visible && message"
    class="ui-conflict-alert"
    :title="title"
    :type="type"
    :closable="closable"
    @close="visible = false"
  >
    <template #icon>
      <n-icon :component="WarningOutline" />
    </template>
    <div class="ui-conflict-alert__message">{{ message }}</div>
    <slot />
  </n-alert>
</template>

<style scoped>
.ui-conflict-alert {
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
}

.ui-conflict-alert__message {
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}
</style>
