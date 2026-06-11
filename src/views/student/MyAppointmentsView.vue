<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  NButton,
  NDatePicker,
  NInput,
  NModal,
  NSelect,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import StatusTag from '@/components/common/StatusTag.vue'
import DataTablePage from '@/components/ui/DataTablePage.vue'
import { useTablePagination } from '@/composables/useTablePagination'
import { cancelAppointment, getMyAppointments } from '@/api/student'
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
const dateRange = ref<[number, number] | null>(null)

const { pagination, setTotal, resetPage, bindRemoteTable } = useTablePagination()

const columns: DataTableColumns<Appointment> = [
  { title: '预约编号', key: 'appointmentNo', width: 160 },
  { title: '预约日期', key: 'appointmentDate', width: 120 },
  {
    title: '时间段',
    key: 'slotName',
    width: 170,
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
      return h(StatusTag, { value: row.appointmentStatus, type: 'appointment', strong: true })
    },
  },
  {
    title: '备注',
    key: 'auditRemark',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      return row.auditRemark || row.rejectReason || '-'
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
        return h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => openCancelModal(row),
          },
          { default: () => '撤销' },
        )
      }
      return null
    },
  },
]

function formatDate(timestamp: number) {
  return dayjs(timestamp).format('YYYY-MM-DD')
}

function getDateRangeParams() {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return {}
  }

  const [start, end] = dateRange.value
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

async function fetchData() {
  loading.value = true
  try {
    const response = await getMyAppointments({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: statusFilter.value || undefined,
      ...getDateRangeParams(),
    })
    const result = response.data.data
    data.value = result?.records || []
    setTotal(result?.total || 0)
  } catch (error: any) {
    message.error(error.response?.data?.message || '获取预约列表失败')
  } finally {
    loading.value = false
  }
}

const { onUpdatePage, onUpdatePageSize } = bindRemoteTable(fetchData)

function applyFilters() {
  resetPage()
  fetchData()
}

function handleResetFilters() {
  statusFilter.value = ''
  dateRange.value = null
  applyFilters()
}

function openCancelModal(appointment: Appointment) {
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
    await cancelAppointment(cancelingAppointment.value.id, { reason: cancelReason.value.trim() })
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
  router.push('/student/appointment-create')
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DataTablePage
    title="我的预约"
    description="查看和管理您的预约记录"
    table-title="预约列表"
    :loading="loading"
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :scroll-x="1250"
    @search="applyFilters"
    @reset="handleResetFilters"
    @update:page="onUpdatePage"
    @update:page-size="onUpdatePageSize"
  >
    <template #header-actions>
      <n-button type="primary" @click="handleCreateAppointment">
        新建预约
      </n-button>
    </template>

    <template #search>
      <n-select
        v-model:value="statusFilter"
        :options="statusOptions"
        placeholder="筛选状态"
        clearable
        style="width: 150px"
      />
      <n-date-picker
        v-model:value="dateRange"
        type="daterange"
        clearable
        style="width: 260px"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </template>
  </DataTablePage>

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
</template>
