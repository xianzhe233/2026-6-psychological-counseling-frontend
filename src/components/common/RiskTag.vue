<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import {
  AlertCircleOutline,
  AlertOutline,
  CheckmarkCircleOutline,
  WarningOutline,
} from '@vicons/ionicons5'

import { resolveStatus, riskLevelMap } from '@/constants/status-colors'

const props = withDefaults(
  defineProps<{
    value: string
    size?: 'small' | 'medium' | 'large'
    bordered?: boolean
    round?: boolean
    showIcon?: boolean
    strong?: boolean
  }>(),
  {
    size: 'small',
    bordered: false,
    round: true,
    showIcon: false,
    strong: true,
  },
)

const config = computed(() => resolveStatus(props.value, riskLevelMap))

const iconComponent = computed(() => {
  switch (props.value) {
    case 'LOW':
      return CheckmarkCircleOutline
    case 'MEDIUM':
      return WarningOutline
    case 'HIGH':
      return AlertOutline
    case 'URGENT':
      return AlertCircleOutline
    default:
      return AlertOutline
  }
})

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
    <template v-if="showIcon" #icon>
      <n-icon :component="iconComponent" />
    </template>
    {{ config.label }}
  </n-tag>
</template>
