<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { NButton, NCard, NDataTable, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
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
          h(RiskTag, { value: row.crisisLevel }),
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

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div class="my-schedule-view">
    <PageHeader
      title="我的咨询日程"
      description="查看正式咨询安排，按日期范围、状态和学生关键词筛选，并录入咨询记录。"
    />

    <n-card title="搜索筛选">
      <div class="search-panel">
        <label class="search-field">
          <span>日期范围</span>
          <div class="date-range">
            <input v-model="searchForm.startDate" type="date" @change="handleSearch">
            <span>至</span>
            <input v-model="searchForm.endDate" type="date" @change="handleSearch">
          </div>
        </label>

        <label class="search-field">
          <span>状态</span>
          <select :value="searchForm.status ?? ''" @change="handleStatusChange">
            <option value="">全部</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>学生关键词</span>
          <input
            v-model="searchForm.studentKeyword"
            type="text"
            placeholder="姓名 / 学号 / 院系"
            @keyup.enter="handleSearch"
          >
        </label>
      </div>

      <div class="search-actions">
        <n-button @click="handleReset">重置</n-button>
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>
    </n-card>

    <n-card title="日程列表" style="margin-top: 16px">
      <n-data-table
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="page => { pagination.page = page; fetchData() }"
        @update:page-size="pageSize => { pagination.pageSize = pageSize; pagination.page = 1; fetchData() }"
      />
    </n-card>
  </div>
</template>

<style scoped>
.my-schedule-view {
  padding: 16px;
}

.search-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.search-field input,
.search-field select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input {
  min-width: 0;
  flex: 1;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
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
