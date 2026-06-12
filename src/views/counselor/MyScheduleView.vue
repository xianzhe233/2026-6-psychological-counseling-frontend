<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { NButton, NDataTable, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SearchPanel from '@/components/ui/SearchPanel.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { pageMySchedules } from '@/api/counselor'
import type { CounselorScheduleVO, ScheduleStatus } from '@/api/counselor'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const data = ref<CounselorScheduleVO[]>([])

const searchForm = reactive({
  studentKeyword: '',
  startDate: '',
  endDate: '',
  status: null as ScheduleStatus | null,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const statusOptions = [
  { label: '已预约', value: 'RESERVED' },
  { label: '完成咨询', value: 'COMPLETED' },
  { label: '旷约', value: 'ABSENT' },
  { label: '请假', value: 'LEAVE' },
  { label: '脱落', value: 'DROPPED' },
  { label: '结案', value: 'CLOSED' },
  { label: '已取消', value: 'CANCELED' },
]

const columns: DataTableColumns<CounselorScheduleVO> = [
  {
    title: '学生',
    key: 'student',
    width: 120,
    render(row) {
      return h('div', { class: 'schedule-cell' }, [
        h('div', { class: 'schedule-cell__main' }, row.studentName),
        h('div', { class: 'schedule-cell__sub' }, row.studentNo),
      ])
    },
  },
  {
    title: '咨询时间',
    key: 'time',
    width: 170,
    render(row) {
      return h('div', { class: 'schedule-cell' }, [
        h('div', { class: 'schedule-cell__main' }, row.consultationDate),
        h('div', { class: 'schedule-cell__sub' }, `${row.slotName} ${row.startTime}-${row.endTime}`),
      ])
    },
  },
  { title: '地点', key: 'roomName', width: 120 },
  {
    title: '问题类型',
    key: 'problem',
    width: 130,
    render(row) {
      return h(NSpace, { size: 6, vertical: true }, {
        default: () => [
          h('span', row.problemTypeLabel),
          h(RiskTag, { value: row.crisisLevel, showIcon: ['HIGH', 'URGENT'].includes(row.crisisLevel) }),
        ],
      })
    },
  },
  { title: '第几次', key: 'sessionIndex', width: 80, render: row => `第 ${row.sessionIndex} 次` },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.status, type: 'schedule' })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', onClick: () => handleRecord(row) }, { default: () => '录入记录' }),
          h(NButton, { size: 'small', onClick: () => handleReport(row) }, { default: () => '结案报告' }),
        ],
      })
    },
  },
]

async function fetchData() {
  loading.value = true
  try {
    const result = await pageMySchedules({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      studentKeyword: searchForm.studentKeyword,
      startDate: searchForm.startDate || undefined,
      endDate: searchForm.endDate || undefined,
      status: searchForm.status,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询日程失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchData()
}

function handleReset() {
  searchForm.studentKeyword = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  searchForm.status = null
  handleSearch()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.status = value ? value as ScheduleStatus : null
  handleSearch()
}

function handleRecord(row: CounselorScheduleVO) {
  router.push(`/counselor/records/${row.id}`)
}

function handleReport(row: CounselorScheduleVO) {
  router.push({ path: '/counselor/case-reports', query: { studentId: row.studentId } })
}

function rowClassName(row: CounselorScheduleVO) {
  return row.consultationDate === dayjs().format('YYYY-MM-DD') ? 'today-schedule-row' : ''
}

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <PageContainer class="my-schedule-view bp-page">
    <PageHeader
      title="我的咨询日程"
      description="查看正式咨询安排，按日期范围、状态和学生关键词筛选，并录入咨询记录。"
    />

    <SearchPanel :loading="loading" @search="handleSearch" @reset="handleReset">
      <div class="bp-form-grid bp-form-grid--responsive">
        <FormField label="日期范围">
          <div class="date-range">
            <input v-model="searchForm.startDate" class="bp-form-control" type="date" @change="handleSearch">
            <span class="date-range__sep">至</span>
            <input v-model="searchForm.endDate" class="bp-form-control" type="date" @change="handleSearch">
          </div>
        </FormField>

        <FormField label="状态">
          <select
            class="bp-form-control"
            :value="searchForm.status ?? ''"
            @change="handleStatusChange"
          >
            <option value="">全部</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </FormField>

        <FormField label="学生关键词">
          <input
            v-model="searchForm.studentKeyword"
            class="bp-form-control"
            type="text"
            placeholder="姓名 / 学号 / 院系"
            @keyup.enter="handleSearch"
          >
        </FormField>
      </div>
    </SearchPanel>

    <SectionCard title="日程列表">
      <EmptyState
        v-if="!loading && data.length === 0"
        title="暂无咨询日程"
        description="调整日期范围或状态筛选后重试"
      />
      <n-data-table
        v-else
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-class-name="rowClassName"
        :row-key="row => row.id"
        @update:page="page => { pagination.page = page; fetchData() }"
        @update:page-size="pageSize => { pagination.pageSize = pageSize; pagination.page = 1; fetchData() }"
      />
    </SectionCard>
  </PageContainer>
</template>

<style scoped>
.date-range {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-range__sep {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.date-range input {
  min-width: 0;
  flex: 1;
}

:deep(.today-schedule-row td) {
  background: var(--color-primary-subtle);
}

.schedule-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-cell__main {
  color: #111827;
  font-weight: 600;
}

.schedule-cell__sub {
  color: #6b7280;
  font-size: 12px;
}
</style>
