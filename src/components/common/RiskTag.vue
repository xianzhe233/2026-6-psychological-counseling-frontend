<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

const props = defineProps<{
  value: string
}>()

const config = computed(() => {
  switch (props.value) {
    case 'LOW':
      return { label: '低风险', type: 'success' as const }
    case 'MEDIUM':
      return { label: '中风险', type: 'warning' as const }
    case 'HIGH':
      return { label: '高风险', type: 'error' as const }
    case 'URGENT':
      return { label: '紧急风险', type: 'error' as const }
    default:
      return { label: props.value, type: 'default' as const }
  }
})
</script>

<template>
  <n-tag :type="config.type" round>{{ config.label }}</n-tag>
</template>
