<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { DocumentOutline, DownloadOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    text?: string
    loading?: boolean
    disabled?: boolean
    type?: 'primary' | 'default' | 'info' | 'success' | 'warning' | 'error'
    size?: 'tiny' | 'small' | 'medium' | 'large'
    block?: boolean
    fileType?: 'word' | 'generic'
  }>(),
  {
    text: '下载文件',
    loading: false,
    disabled: false,
    type: 'primary',
    size: 'medium',
    block: false,
    fileType: 'word',
  },
)

const emit = defineEmits<{
  download: []
}>()
</script>

<template>
  <n-button
    class="ui-file-download-button"
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    @click="emit('download')"
  >
    <template #icon>
      <n-icon :component="fileType === 'word' ? DocumentOutline : DownloadOutline" />
    </template>
    {{ text }}
  </n-button>
</template>

<style scoped>
.ui-file-download-button {
  border-radius: var(--radius-button);
}
</style>
