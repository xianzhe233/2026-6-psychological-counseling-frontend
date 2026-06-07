<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NSelect, NDatePicker, NSpace, NTag, NModal, NInput, useMessage, useDialog } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyAppointments, cancelAppointment } from '@/api/student'
import type { Appointment } from '@/types/student'

const message = useMessage()
const dialog = useDialog()

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const showCancelModal = ref(false)
const cancelReason = ref('')
const cancellingAppointmentId = ref<number | null>(null)

const statusOptions = [
  { label: '全部', value: null },
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已撤销', value: 'CANCELED' },
  { label: '已完成', value: 'COMPLETED' }
]

const columns = [
  { title: '预约编号', key: 'appointmentNo', width: 150 },
  { title: '预约日期', key: 'appointmentDate', width: 120 },
  { title: '时间段', key: 'slotName', width: 120 },
  { title: '初访员', key: 'interviewerName', width: 100 },
  { title: '咨询室', key: 'roomName', width: 120 },
  { 
    title: '状态', 
    key: 'appointmentStatus', 
    width: 100,
    render(row: Appointment) {
      const statusMap: Record<string, { label: string; type: string }> = {
        PENDING: { label: '待审核', type: 'warning' },
        APPROVED: { label: '已通过', type: 'success' },
        REJECTED: { label: '已驳回', type: 'error' },
        CANCELED: { label: '已撤销', type: 'default' },
        COMPLETED: { label: '已完成', type: 'info' }
      }
      const status = statusMap[row.appointmentStatus] || { label: row.appointmentStatus, type: 'default' }
      return h(NTag, { type: status.type as any }, { default: () => status.label })
    }
  },
  { 
    title: '审核备注', 
    key: 'auditRemark', 
    width: 150,
    render(row: Appointment) {
      return row.auditRemark || row.rejectReason || '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: Appointment) {
      if (row.appointmentStatus === 'PENDING') {
        return h(NButton, {
          size: 'small',
          type: 'error',
          onClick: () => handleCancel(row.id)
        }, { default: () => '撤销' })
      }
      return null
    }
  }
]

async function fetchAppointments() {
  loading.value = true
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    const { data } = await getMyAppointments(params)
    appointments.value = data.data.records
    total.value = data.data.total
  } catch (error) {
    console.error('获取预约列表失败', error)
    message.error('获取预约列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pageNum.value = page
  fetchAppointments()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  pageNum.value = 1
  fetchAppointments()
}

function handleStatusChange(value: string | null) {
  statusFilter.value = value
  pageNum.value = 1
  fetchAppointments()
}

function handleDateChange(value: [number, number] | null) {
  dateRange.value = value
  // 日期筛选需要后端支持，这里暂时不实现
}

function handleCancel(appointmentId: number) {
  cancellingAppointmentId.value = appointmentId
  cancelReason.value = ''
  showCancelModal.value = true
}

async function confirmCancel() {
  if (!cancellingAppointmentId.value) return
  if (!cancelReason.value.trim()) {
    message.error('请填写撤销原因')
    return
  }
  
  try {
    await cancelAppointment(cancellingAppointmentId.value, { reason: cancelReason.value })
    message.success('撤销成功')
    showCancelModal.value = false
    fetchAppointments()
  } catch (error: any) {
    message.error(error?.message || '撤销失败')
  }
}

onMounted(() => {
  fetchAppointments()
})
</script>

<template>
  <div class="my-appointments-view">
    <PageHeader title="我的预约" description="查看和管理您的预约记录" />
    
    <n-card class="appointments-card">
      <div class="filter-section">
        <n-space>
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="按状态筛选"
            clearable
            style="width: 150px"
            @update:value="handleStatusChange"
          />
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            clearable
            @update:value="handleDateChange"
          />
        </n-space>
      </div>
      
      <n-data-table
        :columns="columns"
        :data="appointments"
        :loading="loading"
        :pagination="{
          page: pageNum,
          pageSize: pageSize,
          itemCount: total,
          showSizePicker: true,
          pageSizes: [10, 20, 50],
          onUpdatePage: handlePageChange,
          onUpdatePageSize: handlePageSizeChange
        }"
        :row-key="(row: Appointment) => row.id"
      />
    </n-card>
    
    <n-modal v-model:show="showCancelModal" title="撤销预约">
      <n-card>
        <p>确定要撤销此预约吗？撤销后需要重新预约。</p>
        <n-input
          v-model:value="cancelReason"
          type="textarea"
          placeholder="请填写撤销原因"
          :rows="3"
        />
        <template #footer>
          <n-space justify="end">
            <n-button @click="showCancelModal = false">取消</n-button>
            <n-button type="error" @click="confirmCancel">确认撤销</n-button>
          </n-space>
        </template>
      </n-card>
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

.filter-section {
  margin-bottom: 16px;
}
</style>