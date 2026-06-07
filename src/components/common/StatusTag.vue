<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

const props = defineProps<{
  value: string
  type?: 'appointment' | 'queue' | 'schedule' | 'report'
}>()

const mapping: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  PENDING: { label: '待处理', type: 'info' },
  APPROVED: { label: '已通过', type: 'success' },
  REJECTED: { label: '已驳回', type: 'error' },
  CANCELED: { label: '已取消', type: 'default' },
  COMPLETED: { label: '已完成', type: 'success' },
  WAITING: { label: '排队中', type: 'warning' },
  ARRANGED: { label: '已安排', type: 'success' },
  DEFERRED: { label: '已暂缓', type: 'default' },
  RESERVED: { label: '已预约', type: 'info' },
  ABSENT: { label: '旷约', type: 'warning' },
  LEAVE: { label: '请假', type: 'warning' },
  DROPPED: { label: '脱落', type: 'error' },
  CLOSED: { label: '已结案', type: 'default' },
  DRAFT: { label: '草稿', type: 'default' },
  SUBMITTED: { label: '已提交', type: 'success' }
}

const config = computed(() => mapping[props.value] ?? { label: props.value, type: 'default' as const })
</script>

<template>
  <n-tag :type="config.type" round>{{ config.label }}</n-tag>
</template>
