<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { appointmentStatusMap, resolveStatus } from '@/constants/status-colors'

const props = withDefaults(
  defineProps<{
    value: string
    type?: 'appointment' | 'queue' | 'schedule' | 'report'
    size?: 'small' | 'medium' | 'large'
    bordered?: boolean
    round?: boolean
    strong?: boolean
  }>(),
  {
    type: 'appointment',
    size: 'small',
    bordered: false,
    round: true,
    strong: false,
  },
)

const config = computed(() => resolveStatus(props.value, appointmentStatusMap))

const tagStyle = computed(() => {
  if (!props.strong || !config.value.background) return undefined
  return {
    background: config.value.background,
    color: config.value.color,
    borderColor: config.value.color,
  }
})
</script>

<template>
  <n-tag
    :type="config.type"
    :size="size"
    :bordered="bordered"
    :round="round"
    :style="tagStyle"
  >
    {{ config.label }}
  </n-tag>
</template>
