<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'

import type { FilterTagItem } from '@/components/ui/types'

defineProps<{
  items: FilterTagItem[]
  label?: string
}>()

const emit = defineEmits<{
  remove: [key: string]
  clear: []
}>()
</script>

<template>
  <div v-if="items.length" class="ui-filter-tags">
    <span v-if="label" class="ui-filter-tags__label">{{ label }}</span>
    <n-tag
      v-for="item in items"
      :key="item.key"
      closable
      round
      type="info"
      @close="emit('remove', item.key)"
    >
      {{ item.label }}：{{ item.value }}
    </n-tag>
    <n-button text type="primary" size="small" @click="emit('clear')">
      清空筛选
    </n-button>
  </div>
</template>
