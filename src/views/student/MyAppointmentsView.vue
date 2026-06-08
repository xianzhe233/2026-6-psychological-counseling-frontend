<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  NModal,
  NInput,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyAppointments, cancelAppointment } from '@/api/student'
import type { Appointment } from '@/types/student'

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const data = ref<Appointment[]>([])
const showCancelModal = ref(false)
const cancelingAppointment = ref<Appointment | null>(null)
const cancelReason = ref('')
const canceling = ref(false)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已撤销', value: 'CANCELED' },
  { label: '已完成', value: 'COMPLETED' },
]

const statusFilter = ref('')

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

const columns: DataTableColumns<Appointment> = [
  { title: '预约编号', key: 'appointmentNo', width: 160 },
  { title: '预约日期', key: 'appointmentDate', width: 120 },
  {
    title: '时间段',
    key: 'slotName',
    width: 150,
    render(row) {
      return `${row.slotName} (${row.startTime}-${row.endTime})`
    },
  },
  { title: '初访员', key: 'interviewerName', width: 100 },
  { title: '咨询室', key: 'roomName', width: 120 },
  {
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    render(row) {
      const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
        PENDING: { label: '待审核', type: 'warning' },
        APPROVED: { label: '已通过', type: 'success' },
        REJECTED: { label: '已驳回', type: 'error' },
        CANCELED: { label: '已撤销', type: 'default' },
        COMPLETED: { label: '已完成', type: 'info' },
      }
      const status = statusMap[row.appointmentStatus] || { label: row.appointmentStatus, type: 'default' }
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.label })
    },
  },
  {
    title: '审核备注',
    key: 'auditRemark',
    width: 150,
    ellipsis: { tooltip: true },
    render(row) {
      return row.auditRemark || '-'
    },
  },
  { title: '创建时间', key: 'createTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render(row) {
      if (row.appointmentStatus === 'PENDING' || row.appointmentStatus === 'APPROVED') {
        return h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleCancel(row),
        }, { default: () => '撤销' })
      }
      return null
    },
  },
]

async function fetchData() {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    const response = await getMyAppointments(params)
    const result = response.data.data
    data.value = result?.records || []
    pagination.itemCount = result?.total || 0
  } catch (error: any) {
    message.error(error.response?.data?.message || '获取预约列表失败')
  } finally {
    loading.value = false
  }
}

function handleStatusChange() {
  pagination.page = 1
  fetchData()
}

function handleCancel(appointment: Appointment) {
  cancelingAppointment.value = appointment
  cancelReason.value = ''
  showCancelModal.value = true
}

async function handleConfirmCancel() {
  if (!cancelingAppointment.value) return
  if (!cancelReason.value.trim()) {
    message.warning('请输入撤销原因')
    return
  }

  canceling.value = true
  try {
    await cancelAppointment(cancelingAppointment.value.id, { reason: cancelReason.value })
    message.success('预约已撤销')
    showCancelModal.value = false
    fetchData()
  } catch (error: any) {
    message.error(error.response?.data?.message || '撤销预约失败')
  } finally {
    canceling.value = false
  }
}

function handleCreateAppointment() {
  router.push('/student/appointments/create')
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="my-appointments-view">
    <PageHeader title="我的预约" description="查看和管理您的预约记录" />

    <n-card class="appointments-card">
      <template #header-extra>
        <n-space>
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="筛选状态"
            clearable
            style="width: 150px"
            @update:value="handleStatusChange"
          />
          <n-button type="primary" @click="handleCreateAppointment">
            新建预约
          </n-button>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        scroll-x="1200"
        remote
      />
    </n-card>

    <n-modal
      v-model:show="showCancelModal"
      title="撤销预约"
      preset="dialog"
      positive-text="确认撤销"
      negative-text="取消"
      :loading="canceling"
      @positive-click="handleConfirmCancel"
    >
      <p>确定要撤销预约 <strong>{{ cancelingAppointment?.appointmentNo }}</strong> 吗？</p>
      <n-input
        v-model:value="cancelReason"
        type="textarea"
        placeholder="请输入撤销原因"
        :rows="3"
        style="margin-top: 12px"
      />
    </n-modal>
  </div>
</template>

<style scoped>
.my-appointments-view {
  padding: 24px;
}

.appointments-card {
  margin-top: 24px;
}
</style>
