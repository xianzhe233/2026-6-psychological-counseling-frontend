<script setup lang="ts">
import { computed } from 'vue'

import { getPriorityLevel, priorityLevelConfig } from '@/constants/status-colors'

const props = defineProps<{
  score: number
  showBar?: boolean
  showLabel?: boolean
}>()

const level = computed(() => getPriorityLevel(props.score))
const config = computed(() => priorityLevelConfig[level.value])

const barWidth = computed(() => `${Math.min(100, Math.max(8, props.score))}%`)
</script>

<template>
  <span
    class="ui-priority-badge"
    :style="{
      color: config.color,
      background: config.background,
    }"
  >
    <span v-if="showLabel !== false" class="ui-priority-badge__label">
      {{ config.label }} · {{ score }}
    </span>
    <span v-if="showBar" class="ui-priority-badge__bar">
      <span
        class="ui-priority-badge__bar-fill"
        :style="{ width: barWidth, background: config.color }"
      />
    </span>
  </span>
</template>
