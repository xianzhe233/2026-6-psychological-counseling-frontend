<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { NCard, NDataTable, NTag, NButton, NSpace, NModal, NInput, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyAppointments, cancelAppointment } from '@/api/student'
import type { Appointment } from '@/types/student'

const message = useMessage()

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string | null>(null)

// 取消预约相关
const showCancelModal = ref(false)
const cancelingAppointment = ref<Appointment | null>(null)
const cancelReason = ref('')
const canceling = ref(false)

// 表格列定义
const columns = [
  {
    title: '预约编号',
    key: 'appointmentNo',
    width: 150
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
    title: '初访员',
    key: 'interviewerName',
    width: 100
  },
  {
    title: '咨询室',
    key: 'roomName',
    width: 120
  },
  {
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    render(row: Appointment) {
      const statusMap: Record<string, { label: string; type: string }> = {
        PENDING: { label: '待审核', type: 'warning' },
        APPROVED: { label: '已通过', type: 'success' },
        REJECTED: { label: '已驳回', type: 'error' },
        CANCELED: { label: '已取消', type: 'default' },
        COMPLETED: { label: '已完成', type: 'info' }
      }
      const status = statusMap[row.appointmentStatus] || { label: row.appointmentStatus, type: 'default' }
      return h(NTag, { type: status.type as any, size: 'small' }, { default: () => status.label })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: Appointment) {
      if (row.appointmentStatus === 'PENDING' || row.appointmentStatus === 'APPROVED') {
        return h(NButton, {
          type: 'error',
          size: 'small',
          onClick: () => openCancelModal(row)
        }, { default: () => '取消' })
      }
      return null
    }
  }
]

// 分页配置
const pagination = computed(() => ({
  page: pageNum.value,
  pageSize: pageSize.value,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [5, 10, 20],
  onChange: handlePageChange,
  onUpdatePageSize: handlePageSizeChange,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
}))

// 获取预约列表
async function fetchAppointments() {
  loading.value = true
  try {
    const { data } = await getMyAppointments({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined
    })
    appointments.value = data.data?.records || []
    total.value = data.data?.total || 0
  } catch (error) {
    console.error('获取预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开取消预约弹窗
function openCancelModal(appointment: Appointment) {
  cancelingAppointment.value = appointment
  cancelReason.value = ''
  showCancelModal.value = true
}

// 取消预约
async function handleCancelAppointment() {
  if (!cancelingAppointment.value) return
  
  if (!cancelReason.value.trim()) {
    message.error('请输入取消原因')
    return
  }
  
  canceling.value = true
  try {
    await cancelAppointment(cancelingAppointment.value.id, { reason: cancelReason.value })
    message.success('预约已取消')
    showCancelModal.value = false
    fetchAppointments()
  } catch (error: any) {
    message.error(error.response?.data?.message || '取消预约失败')
  } finally {
    canceling.value = false
  }
}

// 页码变化
function handlePageChange(page: number) {
  pageNum.value = page
  fetchAppointments()
}

// 每页数量变化
function handlePageSizeChange(size: number) {
  pageSize.value = size
  pageNum.value = 1
  fetchAppointments()
}

onMounted(() => {
  fetchAppointments()
})
</script>

<template>
  <div class="my-appointments-view">
    <PageHeader title="我的预约" description="查看和管理您的预约记录" />
    <n-card class="appointments-card">
      <n-data-table
        :columns="columns"
        :data="appointments"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: Appointment) => row.id"
        remote
      />
    </n-card>
    
    <!-- 取消预约弹窗 -->
    <n-modal v-model:show="showCancelModal" preset="dialog" title="取消预约">
      <n-space vertical>
        <p>确定要取消预约 {{ cancelingAppointment?.appointmentNo }} 吗？</p>
        <n-input
          v-model:value="cancelReason"
          type="textarea"
          placeholder="请输入取消原因"
          :rows="3"
        />
      </n-space>
      <template #action>
        <n-space>
          <n-button @click="showCancelModal = false">取消</n-button>
          <n-button type="error" :loading="canceling" @click="handleCancelAppointment">
            确定取消
          </n-button>
        </n-space>
      </template>
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