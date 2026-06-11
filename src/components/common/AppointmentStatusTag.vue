<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { resolveStatus, studentAppointmentStatusMap } from '@/constants/status-colors'

const props = withDefaults(
  defineProps<{
    value: string
    size?: 'small' | 'medium' | 'large'
    bordered?: boolean
    round?: boolean
  }>(),
  {
    size: 'small',
    bordered: false,
    round: true,
  },
)

const config = computed(() => resolveStatus(props.value, studentAppointmentStatusMap))
</script>

<template>
  <n-tag
    :type="config.type"
    :size="size"
    :bordered="bordered"
    :round="round"
    :style="config.background ? { background: config.background, color: config.color } : undefined"
  >
    {{ config.label }}
  </n-tag>
</template>
