<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { NButton, NCard, NDataTable, NDatePicker, NForm, NFormItem, NSelect, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { pageInterviewTasksReal } from '@/api/interviewer'
import type { RealInterviewTaskVO } from '@/api/interviewer'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const tasks = ref<RealInterviewTaskVO[]>([])

const searchForm = reactive({
  dateRange: null as [string, string] | null,
  status: null as string | null,
  riskLevel: null as string | null,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const statusOptions = [
  { label: '已通过', value: 'APPROVED' },
  { label: '已完成', value: 'COMPLETED' },
]

const riskLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' },
]

const columns: DataTableColumns<RealInterviewTaskVO> = [
  { title: '预约编号', key: 'appointmentNo', width: 150 },
  { title: '学生姓名', key: 'studentName', width: 110 },
  { title: '学号', key: 'studentNo', width: 130 },
  { title: '预约日期', key: 'appointmentDate', width: 120 },
  { title: '时间段', key: 'slotName', width: 160 },
  {
    title: '地点',
    key: 'roomName',
    width: 140,
    render(row) {
      return row.roomName || '-'
    },
  },
  {
    title: '风险等级',
    key: 'riskLevel',
    width: 110,
    render(row) {
      return h(RiskTag, { value: row.riskLevel })
    },
  },
  {
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.appointmentStatus })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          row.appointmentStatus === 'APPROVED'
            ? h(
                NButton,
                {
                  size: 'small',
                  type: 'primary',
                  onClick: () => router.push(`/interviewer/tasks/${row.appointmentId}/result`),
                },
                { default: () => '录入结果' },
              )
            : h(
                NButton,
                {
                  size: 'small',
                  onClick: () => router.push(`/interviewer/tasks/${row.appointmentId}/result`),
                },
                { default: () => '查看结果' },
              ),
        ],
      })
    },
  },
]

// 通过真实后端接口加载初访任务列表
async function fetchTasks() {
  loading.value = true
  try {
    const { data: result } = await pageInterviewTasksReal({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      status: searchForm.status || undefined,
      riskLevel: searchForm.riskLevel || undefined,
    })
    tasks.value = result.data.records
    pagination.itemCount = result.data.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载初访任务失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchTasks()
}

function handleReset() {
  searchForm.dateRange = null
  searchForm.status = null
  searchForm.riskLevel = null
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  void fetchTasks()
}

function handlePageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  void fetchTasks()
}

onMounted(() => {
  void fetchTasks()
})
</script>

<template>
  <div class="interview-task-view">
    <PageHeader
      title="我的初访任务"
      description="初访员可按日期、状态、风险等级筛选任务，并进入初访结果录入页面。"
    />

    <n-card>
      <n-form inline :model="searchForm" @submit.prevent="handleSearch">
        <n-form-item label="日期范围">
          <n-date-picker
            v-model:formatted-value="searchForm.dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            clearable
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="全部状态" clearable style="min-width: 120px" />
        </n-form-item>
        <n-form-item label="风险等级">
          <n-select v-model:value="searchForm.riskLevel" :options="riskLevelOptions" placeholder="全部风险" clearable style="min-width: 120px" />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">搜索</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <n-data-table
        :columns="columns"
        :data="tasks"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1100"
        remote
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>
  </div>
</template>

<style scoped>
.interview-task-view {
  padding: 16px;
}
</style>
