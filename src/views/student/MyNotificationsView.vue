<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { NCard, NDataTable, NSelect, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyNotifications } from '@/api/student'
import type { Notification } from '@/types/student'

const message = useMessage()
const loading = ref(false)
const data = ref<Notification[]>([])

const notifyTypeOptions = [
  { label: '全部', value: '' },
  { label: '预约审核通过', value: 'APPOINTMENT_APPROVED' },
  { label: '预约驳回通知', value: 'APPOINTMENT_REJECTED' },
  { label: '预约改约通知', value: 'APPOINTMENT_RESCHEDULED' },
  { label: '预约撤销通知', value: 'APPOINTMENT_CANCELED' },
  { label: '咨询安排通知', value: 'CONSULTATION_ARRANGED' },
  { label: '咨询取消通知', value: 'CONSULTATION_CANCELED' },
  { label: '系统通知', value: 'SYSTEM' },
]

const notifyTypeFilter = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
  onChange: (page: number) => {
    pagination.page = page
    fetchData()
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    fetchData()
  },
})

const columns: DataTableColumns<Notification> = [
  {
    title: '类型',
    key: 'notifyType',
    width: 150,
    render(row) {
      const typeMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
        APPOINTMENT_APPROVED: { label: '预约审核通过', type: 'success' },
        APPOINTMENT_REJECTED: { label: '预约驳回通知', type: 'error' },
        APPOINTMENT_RESCHEDULED: { label: '预约改约通知', type: 'warning' },
        APPOINTMENT_CANCELED: { label: '预约撤销通知', type: 'default' },
        CONSULTATION_ARRANGED: { label: '咨询安排通知', type: 'info' },
        CONSULTATION_CANCELED: { label: '咨询取消通知', type: 'error' },
        SYSTEM: { label: '系统通知', type: 'default' },
      }
      const notifyType = typeMap[row.notifyType] || { label: row.notifyType, type: 'default' }
      return h(NTag, { type: notifyType.type, size: 'small' }, { default: () => notifyType.label })
    },
  },
  { title: '标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  { title: '内容', key: 'content', width: 320, ellipsis: { tooltip: true } },
  { title: '发送时间', key: 'sendTime', width: 170 },
]

async function fetchData() {
  loading.value = true
  try {
    const response = await getMyNotifications({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      notifyType: notifyTypeFilter.value || undefined,
    })
    const result = response.data.data
    data.value = result?.records || []
    pagination.itemCount = result?.total || 0
  } catch (error: any) {
    message.error(error.response?.data?.message || '获取通知列表失败')
  } finally {
    loading.value = false
  }
}

function handleTypeChange() {
  pagination.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="my-notifications-view">
    <PageHeader title="我的通知" description="查看系统通知和消息" />

    <n-card class="notifications-card">
      <template #header-extra>
        <n-select
          v-model:value="notifyTypeFilter"
          :options="notifyTypeOptions"
          placeholder="筛选类型"
          clearable
          style="width: 180px"
          @update:value="handleTypeChange"
        />
      </template>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        scroll-x="900"
        remote
      />
    </n-card>
  </div>
</template>

<style scoped>
.my-notifications-view {
  padding: 24px;
}

.notifications-card {
  margin-top: 24px;
}
</style>
