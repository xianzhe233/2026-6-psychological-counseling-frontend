<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard,
  NDataTable,
  NButton,
  NSelect,
  NDatePicker,
  NSpace,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { pageInterviewTasks } from '@/api/interviewer'
import type { InterviewTaskVO } from '@/api/interviewer'

const router = useRouter()
const message = useMessage()

// 搜索条件
const searchForm = reactive({
  dateRange: null as [string, string] | null,
  status: null as string | null,
  riskLevel: null as string | null
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
})

// 表格数据
const loading = ref(false)
const tableData = ref<InterviewTaskVO[]>([])

// 选项数据
const statusOptions = [
  { label: '已通过', value: 'APPROVED' },
  { label: '已完成', value: 'COMPLETED' }
]

const riskLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' }
]

// 表格列定义
const columns: DataTableColumns<InterviewTaskVO> = [
  {
    title: '预约编号',
    key: 'appointmentNo',
    width: 150
  },
  {
    title: '学生姓名',
    key: 'studentName',
    width: 100
  },
  {
    title: '学号',
    key: 'studentNo',
    width: 120
  },
  {
    title: '预约日期',
    key: 'appointmentDate',
    width: 120
  },
  {
    title: '时间段',
    key: 'slotName',
    width: 120
  },
  {
    title: '地点',
    key: 'roomName',
    width: 120,
    render(row) {
      return row.roomName || '-'
    }
  },
  {
    title: '风险等级',
    key: 'riskLevel',
    width: 100,
    render(row) {
      return h(RiskTag, { value: row.riskLevel })
    }
  },
  {
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.appointmentStatus })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleViewDetail(row.appointmentId)
          },
          () => '查看详情'
        ),
        row.appointmentStatus === 'APPROVED'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => handleEditResult(row.appointmentId)
              },
              () => '录入结果'
            )
          : null
      ])
    }
  }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.riskLevel) params.riskLevel = searchForm.riskLevel
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const res = await pageInterviewTasks(params)
    tableData.value = res.data.data.records || []
    pagination.itemCount = res.data.data.total || 0
  } catch (error: any) {
    message.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  searchForm.dateRange = null
  searchForm.status = null
  searchForm.riskLevel = null
  handleSearch()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadData()
}

// 查看详情
const handleViewDetail = (id: number) => {
  // 跳转到详情页面或显示详情抽屉
  message.info('查看详情功能待实现')
}

// 录入结果
const handleEditResult = (id: number) => {
  router.push(`/interviewer/tasks/${id}/result`)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="interview-task-view">
    <n-card title="我的初访任务">
      <!-- 搜索区 -->
      <n-space vertical :size="16">
        <n-space>
          <n-date-picker
            v-model:value="searchForm.dateRange"
            type="daterange"
            clearable
            style="width: 300px"
          />
          <n-select
            v-model:value="searchForm.status"
            :options="statusOptions"
            placeholder="任务状态"
            clearable
            style="width: 120px"
          />
          <n-select
            v-model:value="searchForm.riskLevel"
            :options="riskLevelOptions"
            placeholder="风险等级"
            clearable
            style="width: 120px"
          />
          <n-button type="primary" @click="handleSearch">搜索</n-button>
          <n-button @click="handleReset">重置</n-button>
        </n-space>

        <!-- 表格 -->
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :scroll-x="1000"
          remote
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.interview-task-view {
  padding: 16px;
}
</style>
