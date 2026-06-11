<script setup lang="ts">
import { computed } from 'vue'

import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import InfoDescriptions from '@/components/ui/InfoDescriptions.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import type { CounselorScheduleVO } from '@/api/counselor'

type ScheduleDetail = CounselorScheduleVO & {
  firstVisitSummary?: string
  nextAction?: string
}

const props = defineProps<{
  schedule: ScheduleDetail
  mode?: 'schedule' | 'student'
}>()

const title = computed(() => (props.mode === 'student' ? '学生信息' : '日程信息'))

const items = computed(() => {
  if (props.mode === 'student') {
    return [
      { label: '姓名', value: props.schedule.studentName },
      { label: '学号', value: props.schedule.studentNo },
      { label: '院系', value: props.schedule.college },
      { label: '联系电话', value: props.schedule.phone },
      { label: '问题类型', value: props.schedule.problemTypeLabel },
      { label: '危机等级', value: props.schedule.crisisLevel },
      { label: '初访摘要', value: props.schedule.firstVisitSummary, span: 2 as const },
      { label: '后续建议', value: props.schedule.nextAction || '—', span: 2 as const },
    ]
  }

  return [
    { label: '咨询编号', value: props.schedule.scheduleNo },
    { label: '状态', value: props.schedule.status },
    { label: '咨询日期', value: props.schedule.consultationDate },
    {
      label: '时间段',
      value: `${props.schedule.slotName} ${props.schedule.startTime}-${props.schedule.endTime}`,
    },
    { label: '地点', value: props.schedule.roomName },
    { label: '第几次', value: `第 ${props.schedule.sessionIndex} 次` },
  ]
})
</script>

<template>
  <SectionCard :title="title">
    <InfoDescriptions :items="items" :columns="2">
      <template v-for="(item, index) in items" :key="item.label" #[`value-${index}`]="{ item: row }">
        <StatusTag
          v-if="row.label === '状态'"
          :value="String(row.value)"
          type="schedule"
          strong
        />
        <RiskTag
          v-else-if="row.label === '危机等级'"
          :value="String(row.value)"
          show-icon
          strong
        />
        <span v-else>{{ row.value }}</span>
      </template>
    </InfoDescriptions>
  </SectionCard>
</template>
