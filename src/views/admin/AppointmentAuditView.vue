<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useDialog,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  approveAppointmentReal,
  getAuditAppointmentDetailReal,
  getInterviewDutyOptionsReal,
  markPriorityReal,
  pageAuditAppointmentsReal,
  rejectAppointmentReal,
  rescheduleAppointmentReal,
} from '@/api/admin'
import type {
  AppointmentAuditVO,
  AppointmentDetailVO,
  DutyScheduleVO,
  InterviewDutyOption,
  RealAppointmentAuditVO,
} from '@/api/admin'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitting = ref(false)
const appointments = ref<AppointmentAuditVO[]>([])
const dutyOptions = ref<InterviewDutyOption[]>([])
const detail = ref<AppointmentDetailVO | null>(null)

const showDetail = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showRescheduleModal = ref(false)
const currentAppointmentId = ref<number | null>(null)

const searchForm = reactive({
  keyword: '',
  status: null as string | null,
  riskLevel: null as string | null,
  priorityFlag: null as number | null,
  dateRange: null as [string, string] | null,
})

const approveForm = reactive({
  dutyScheduleId: null as number | null,
  auditRemark: '',
})

const rejectForm = reactive({
  reason: '',
})

const rescheduleForm = reactive({
  dutyScheduleId: null as number | null,
  auditRemark: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELED' },
  { label: '已完成', value: 'COMPLETED' },
]

const riskLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' },
]

const priorityOptions = [
  { label: '优先', value: 1 },
  { label: '普通', value: 0 },
]

const dutyScheduleOptions = computed(() => dutyOptions.value.map(item => ({
  label: `${item.appointmentDate} ${item.slotName}｜${item.interviewerName}｜${item.roomName || '未分配'}｜剩余 ${item.remaining}/${item.capacity}`,
  value: item.dutyScheduleId,
  disabled: item.remaining <= 0,
})))

const selectedApproveDuty = computed(() => (
  dutyOptions.value.find(item => item.dutyScheduleId === approveForm.dutyScheduleId) ?? null
))

const selectedRescheduleDuty = computed(() => (
  dutyOptions.value.find(item => item.dutyScheduleId === rescheduleForm.dutyScheduleId) ?? null
))

const columns: DataTableColumns<AppointmentAuditVO> = [
  { title: '预约编号', key: 'appointmentNo', width: 150 },
  { title: '学号', key: 'studentNo', width: 120 },
  { title: '姓名', key: 'studentName', width: 100 },
  { title: '院系', key: 'college', width: 180 },
  {
    title: '主要困扰',
    key: 'mainProblem',
    minWidth: 220,
    ellipsis: { tooltip: true },
  },
  {
    title: '风险等级',
    key: 'riskLevel',
    width: 100,
    render(row) {
      return h(RiskTag, { value: row.riskLevel })
    },
  },
  {
    title: '预约时间',
    key: 'appointmentTime',
    width: 180,
    render(row) {
      return `${row.appointmentDate} ${row.slotName}`
    },
  },
  {
    title: '初访员',
    key: 'interviewerName',
    width: 120,
    render(row) {
      return row.interviewerName || '待分配'
    },
  },
  {
    title: '地点',
    key: 'roomName',
    width: 120,
    render(row) {
      return row.roomName || '-'
    },
  },
  {
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(StatusTag, { value: row.appointmentStatus })
    },
  },
  {
    title: '优先',
    key: 'priorityFlag',
    width: 90,
    render(row) {
      return row.priorityFlag === 1
        ? h(NTag, { round: true, type: 'warning', size: 'small' }, { default: () => '优先' })
        : null
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 260,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small', wrapItem: false }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => void handleViewDetail(row.id) }, { default: () => '查看' }),
          row.appointmentStatus === 'PENDING'
            ? h(NButton, { size: 'small', type: 'success', onClick: () => handleOpenApprove(row.id) }, { default: () => '通过' })
            : null,
          row.appointmentStatus === 'PENDING'
            ? h(NButton, { size: 'small', type: 'error', onClick: () => handleOpenReject(row.id) }, { default: () => '驳回' })
            : null,
          ['PENDING', 'APPROVED'].includes(row.appointmentStatus)
            ? h(NButton, { size: 'small', type: 'warning', onClick: () => handleOpenReschedule(row.id) }, { default: () => '改约' })
            : null,
          row.priorityFlag === 0
            ? h(NButton, { size: 'small', tertiary: true, type: 'info', onClick: () => void handlePriority(row.id) }, { default: () => '标记优先' })
            : null,
        ].filter(Boolean)
      })
    },
  },
]

function rowClassName(row: AppointmentAuditVO) {
  return ['HIGH', 'URGENT'].includes(row.riskLevel) ? 'high-risk-row' : ''
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}



function normalizeRealAppointment(item: RealAppointmentAuditVO): AppointmentDetailVO {
  return {
    id: item.id,
    appointmentNo: item.appointmentNo,
    studentId: item.studentId,
    studentNo: item.studentNo,
    studentName: item.studentName,
    college: item.college,
    phone: item.phone,
    mainProblem: item.mainProblem,
    problemDescription: item.problemDescription,
    expectedHelp: item.expectedHelp,
    moodScore: item.moodScore ?? 0,
    sleepScore: item.sleepScore ?? 0,
    stressScore: item.stressScore ?? 0,
    selfHarmFlag: item.selfHarmFlag ?? 0,
    emergencyFlag: item.emergencyFlag ?? 0,
    riskScore: item.riskScore,
    riskLevel: item.riskLevel as AppointmentDetailVO['riskLevel'],
    appointmentDate: item.appointmentDate,
    slotId: item.slotId,
    slotName: item.slotName,
    startTime: item.startTime,
    endTime: item.endTime,
    interviewerId: item.interviewerId,
    interviewerName: item.interviewerName,
    roomId: item.roomId,
    roomName: item.roomName,
    dutyScheduleId: item.dutyScheduleId,
    appointmentStatus: item.appointmentStatus,
    priorityFlag: item.priorityFlag,
    auditRemark: item.auditRemark,
    rejectReason: item.rejectReason || item.cancelReason,
    auditTime: item.auditTime,
    auditorName: item.auditAdminName,
    createTime: item.createTime,
  }
}

async function fetchDutyOptions() {
  try {
    const { data: result } = await getInterviewDutyOptionsReal()
    dutyOptions.value = result.data.records.map(item => ({
      dutyScheduleId: item.id,
      interviewerId: item.staffId,
      interviewerName: item.staffName,
      appointmentDate: item.dutyDate,
      slotId: item.slotId,
      slotName: item.slotName,
      startTime: item.startTime,
      endTime: item.endTime,
      roomId: item.roomId,
      roomName: item.roomName,
      capacity: item.capacity,
      reservedCount: item.reservedCount,
      remaining: item.remaining,
    }))
  } catch (error) {
    message.error(getErrorMessage(error, '加载值班选项失败'))
  }
}

async function fetchAppointments() {
  loading.value = true
  try {
    const { data: result } = await pageAuditAppointmentsReal({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined,
      riskLevel: searchForm.riskLevel || undefined,
      priorityFlag: searchForm.priorityFlag || undefined,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
    })
    appointments.value = result.data.records.map(normalizeRealAppointment)
    pagination.itemCount = result.data.total
  } catch (error) {
    message.error(getErrorMessage(error, '加载预约审核列表失败'))
  } finally {
    loading.value = false
  }
}

async function handleViewDetail(id: number) {
  try {
    const { data: result } = await getAuditAppointmentDetailReal(id)
    detail.value = normalizeRealAppointment(result.data)
    showDetail.value = true
  } catch (error) {
    message.error(getErrorMessage(error, '加载预约详情失败'))
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchAppointments()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = null
  searchForm.riskLevel = null
  searchForm.priorityFlag = null
  searchForm.dateRange = null
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  void fetchAppointments()
}

function handlePageSizeChange(pageSize: number) {
  pagination.page = 1
  pagination.pageSize = pageSize
  void fetchAppointments()
}

function resetApproveForm() {
  approveForm.dutyScheduleId = null
  approveForm.auditRemark = ''
}

function resetRejectForm() {
  rejectForm.reason = ''
}

function resetRescheduleForm() {
  rescheduleForm.dutyScheduleId = null
  rescheduleForm.auditRemark = ''
}

function handleOpenApprove(id: number) {
  currentAppointmentId.value = id
  resetApproveForm()
  showApproveModal.value = true
}

function handleOpenReject(id: number) {
  currentAppointmentId.value = id
  resetRejectForm()
  showRejectModal.value = true
}

async function handleOpenReschedule(id: number) {
  currentAppointmentId.value = id
  resetRescheduleForm()
  try {
    const { data: result } = await getAuditAppointmentDetailReal(id)
    const currentDetail = normalizeRealAppointment(result.data)
    if (currentDetail.dutyScheduleId) {
      rescheduleForm.dutyScheduleId = currentDetail.dutyScheduleId
      rescheduleForm.auditRemark = currentDetail.auditRemark || ''
    }
    showRescheduleModal.value = true
  } catch (error) {
    message.error(getErrorMessage(error, '加载当前预约信息失败'))
  }
}

async function handlePriority(id: number) {
  dialog.warning({
    title: '确认标记优先',
    content: '标记后该预约会在列表中优先展示，确认继续吗？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await markPriorityReal(id)
        message.success('已标记为优先')
        await fetchAppointments()
      } catch (error) {
        message.error(getErrorMessage(error, '标记优先失败'))
      }
    },
  })
}

async function submitApprove() {
  if (!currentAppointmentId.value || !selectedApproveDuty.value) return

  submitting.value = true
  try {
    await approveAppointmentReal(currentAppointmentId.value, {
      dutyScheduleId: selectedApproveDuty.value.dutyScheduleId,
      interviewerId: selectedApproveDuty.value.interviewerId,
      appointmentDate: selectedApproveDuty.value.appointmentDate,
      slotId: selectedApproveDuty.value.slotId,
      roomId: selectedApproveDuty.value.roomId,
      auditRemark: approveForm.auditRemark,
    })
    message.success('预约已审核通过')
    showApproveModal.value = false
    await Promise.all([fetchDutyOptions(), fetchAppointments()])
  } catch (error) {
    message.error(getErrorMessage(error, '审核通过失败'))
  } finally {
    submitting.value = false
  }
}

function handleApproveConfirm() {
  if (!currentAppointmentId.value) return
  if (!selectedApproveDuty.value) {
    message.warning('请选择分配值班')
    return
  }

  dialog.warning({
    title: '确认审核通过',
    content: '确认将该预约通过并分配到当前值班安排吗？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => submitApprove(),
  })
}

async function submitReject() {
  if (!currentAppointmentId.value) return

  submitting.value = true
  try {
    await rejectAppointmentReal(currentAppointmentId.value, { reason: rejectForm.reason.trim() })
    message.success('预约已驳回')
    showRejectModal.value = false
    await fetchAppointments()
  } catch (error) {
    message.error(getErrorMessage(error, '驳回失败'))
  } finally {
    submitting.value = false
  }
}

function handleRejectConfirm() {
  if (!currentAppointmentId.value) return
  if (!rejectForm.reason.trim()) {
    message.warning('请填写驳回原因')
    return
  }

  dialog.warning({
    title: '确认驳回预约',
    content: '驳回后该预约将进入已驳回状态，确认继续吗？',
    positiveText: '确认驳回',
    negativeText: '取消',
    onPositiveClick: () => submitReject(),
  })
}

async function submitReschedule() {
  if (!currentAppointmentId.value || !selectedRescheduleDuty.value) return

  submitting.value = true
  try {
    await rescheduleAppointmentReal(currentAppointmentId.value, {
      dutyScheduleId: selectedRescheduleDuty.value.dutyScheduleId,
      interviewerId: selectedRescheduleDuty.value.interviewerId,
      appointmentDate: selectedRescheduleDuty.value.appointmentDate,
      slotId: selectedRescheduleDuty.value.slotId,
      roomId: selectedRescheduleDuty.value.roomId,
      auditRemark: rescheduleForm.auditRemark,
    })
    message.success('改约成功')
    showRescheduleModal.value = false
    await Promise.all([fetchDutyOptions(), fetchAppointments()])
  } catch (error) {
    message.error(getErrorMessage(error, '改约失败'))
  } finally {
    submitting.value = false
  }
}

function handleRescheduleConfirm() {
  if (!currentAppointmentId.value) return
  if (!selectedRescheduleDuty.value) {
    message.warning('请选择新的值班安排')
    return
  }

  dialog.warning({
    title: '确认改约',
    content: '确认使用当前选择的值班安排对该预约进行改约吗？',
    positiveText: '确认改约',
    negativeText: '取消',
    onPositiveClick: () => submitReschedule(),
  })
}

watch(showApproveModal, (visible) => {
  if (!visible) resetApproveForm()
})

watch(showRejectModal, (visible) => {
  if (!visible) resetRejectForm()
})

watch(showRescheduleModal, (visible) => {
  if (!visible) resetRescheduleForm()
})

onMounted(async () => {
  await Promise.all([fetchDutyOptions(), fetchAppointments()])
})
</script>

<template>
  <div class="appointment-audit-view">
    <PageHeader
      title="初访预约审核"
      description="管理员可按风险与状态筛选预约，并完成通过、驳回、改约、优先等审核操作。"
    />

    <n-card>
      <n-form inline :model="searchForm" @submit.prevent="handleSearch">
        <n-form-item label="关键词">
          <n-input v-model:value="searchForm.keyword" placeholder="预约编号/姓名/学号/院系" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="全部状态" clearable style="min-width: 120px" />
        </n-form-item>
        <n-form-item label="风险等级">
          <n-select v-model:value="searchForm.riskLevel" :options="riskLevelOptions" placeholder="全部风险" clearable style="min-width: 120px" />
        </n-form-item>
        <n-form-item label="优先标记">
          <n-select v-model:value="searchForm.priorityFlag" :options="priorityOptions" placeholder="全部类型" clearable style="min-width: 100px" />
        </n-form-item>
        <n-form-item label="日期范围">
          <n-date-picker
            v-model:formatted-value="searchForm.dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            clearable
          />
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
        :data="appointments"
        :loading="loading"
        :pagination="pagination"
        :row-class-name="rowClassName"
        :scroll-x="1900"
        remote
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-drawer v-model:show="showDetail" :width="680">
      <n-drawer-content title="预约详情" closable>
        <n-empty v-if="!detail" description="暂无详情数据" />
        <template v-else>
          <n-card title="学生信息" size="small">
            <n-descriptions bordered label-placement="left" :column="2">
              <n-descriptions-item label="预约编号">{{ detail.appointmentNo }}</n-descriptions-item>
              <n-descriptions-item label="预约状态"><StatusTag :value="detail.appointmentStatus" /></n-descriptions-item>
              <n-descriptions-item label="学生姓名">{{ detail.studentName }}</n-descriptions-item>
              <n-descriptions-item label="学号">{{ detail.studentNo }}</n-descriptions-item>
              <n-descriptions-item label="院系">{{ detail.college || '-' }}</n-descriptions-item>
              <n-descriptions-item label="联系电话">{{ detail.phone || '-' }}</n-descriptions-item>
            </n-descriptions>
          </n-card>

          <n-card title="首访登记摘要" size="small" style="margin-top: 16px">
            <n-descriptions bordered label-placement="left" :column="2">
              <n-descriptions-item label="主要困扰">{{ detail.mainProblem }}</n-descriptions-item>
              <n-descriptions-item label="期望帮助">{{ detail.expectedHelp || '-' }}</n-descriptions-item>
              <n-descriptions-item label="问题描述" :span="2">{{ detail.problemDescription || '-' }}</n-descriptions-item>
              <n-descriptions-item label="风险评分">{{ detail.riskScore }}</n-descriptions-item>
              <n-descriptions-item label="风险等级"><RiskTag :value="detail.riskLevel" /></n-descriptions-item>
              <n-descriptions-item label="情绪困扰">{{ detail.moodScore }}/10</n-descriptions-item>
              <n-descriptions-item label="睡眠困扰">{{ detail.sleepScore }}/10</n-descriptions-item>
              <n-descriptions-item label="压力程度">{{ detail.stressScore }}/10</n-descriptions-item>
              <n-descriptions-item label="自伤倾向">{{ detail.selfHarmFlag === 1 ? '是' : '否' }}</n-descriptions-item>
              <n-descriptions-item label="紧急求助">{{ detail.emergencyFlag === 1 ? '是' : '否' }}</n-descriptions-item>
            </n-descriptions>
          </n-card>

          <n-card title="预约与审核信息" size="small" style="margin-top: 16px">
            <n-descriptions bordered label-placement="left" :column="2">
              <n-descriptions-item label="预约时间">{{ detail.appointmentDate }} {{ detail.slotName }}</n-descriptions-item>
              <n-descriptions-item label="初访员">{{ detail.interviewerName || '待分配' }}</n-descriptions-item>
              <n-descriptions-item label="地点">{{ detail.roomName || '-' }}</n-descriptions-item>
              <n-descriptions-item label="优先标记">{{ detail.priorityFlag === 1 ? '是' : '否' }}</n-descriptions-item>
              <n-descriptions-item label="审核备注" :span="2">{{ detail.auditRemark || detail.rejectReason || '-' }}</n-descriptions-item>
              <n-descriptions-item label="审核时间">{{ detail.auditTime || '-' }}</n-descriptions-item>
              <n-descriptions-item label="审核人">{{ detail.auditorName || '-' }}</n-descriptions-item>
              <n-descriptions-item label="提交时间">{{ detail.createTime }}</n-descriptions-item>
            </n-descriptions>
          </n-card>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showApproveModal" preset="card" title="审核通过" style="width: 680px">
      <n-form :model="approveForm" label-placement="left" label-width="90">
        <n-form-item label="分配值班" required>
          <n-select
            v-model:value="approveForm.dutyScheduleId"
            :options="dutyScheduleOptions"
            placeholder="请选择初访员值班安排"
            filterable
          />
        </n-form-item>
        <n-form-item label="审核备注">
          <n-input v-model:value="approveForm.auditRemark" type="textarea" :rows="3" placeholder="可填写安排说明" />
        </n-form-item>
        <n-card v-if="selectedApproveDuty" size="small" embedded>
          <n-descriptions label-placement="left" :column="2">
            <n-descriptions-item label="初访员">{{ selectedApproveDuty.interviewerName }}</n-descriptions-item>
            <n-descriptions-item label="日期">{{ selectedApproveDuty.appointmentDate }}</n-descriptions-item>
            <n-descriptions-item label="时间段">{{ selectedApproveDuty.slotName }}（{{ selectedApproveDuty.startTime }}-{{ selectedApproveDuty.endTime }}）</n-descriptions-item>
            <n-descriptions-item label="地点">{{ selectedApproveDuty.roomName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="容量">{{ selectedApproveDuty.capacity }}</n-descriptions-item>
            <n-descriptions-item label="剩余">{{ selectedApproveDuty.remaining }}</n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showApproveModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleApproveConfirm">确认通过</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showRejectModal" preset="card" title="驳回预约" style="width: 560px">
      <n-form :model="rejectForm" label-placement="left" label-width="90">
        <n-form-item label="驳回原因" required>
          <n-input v-model:value="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRejectModal = false">取消</n-button>
          <n-button type="error" :loading="submitting" @click="handleRejectConfirm">确认驳回</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showRescheduleModal" preset="card" title="改约" style="width: 680px">
      <n-form :model="rescheduleForm" label-placement="left" label-width="90">
        <n-form-item label="新值班安排" required>
          <n-select
            v-model:value="rescheduleForm.dutyScheduleId"
            :options="dutyScheduleOptions"
            placeholder="请选择新的值班安排"
            filterable
          />
        </n-form-item>
        <n-form-item label="改约备注">
          <n-input v-model:value="rescheduleForm.auditRemark" type="textarea" :rows="3" placeholder="请说明改约原因或通知内容" />
        </n-form-item>
        <n-card v-if="selectedRescheduleDuty" size="small" embedded>
          <n-descriptions label-placement="left" :column="2">
            <n-descriptions-item label="初访员">{{ selectedRescheduleDuty.interviewerName }}</n-descriptions-item>
            <n-descriptions-item label="日期">{{ selectedRescheduleDuty.appointmentDate }}</n-descriptions-item>
            <n-descriptions-item label="时间段">{{ selectedRescheduleDuty.slotName }}（{{ selectedRescheduleDuty.startTime }}-{{ selectedRescheduleDuty.endTime }}）</n-descriptions-item>
            <n-descriptions-item label="地点">{{ selectedRescheduleDuty.roomName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="容量">{{ selectedRescheduleDuty.capacity }}</n-descriptions-item>
            <n-descriptions-item label="剩余">{{ selectedRescheduleDuty.remaining }}</n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showRescheduleModal = false">取消</n-button>
          <n-button type="warning" :loading="submitting" @click="handleRescheduleConfirm">确认改约</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.appointment-audit-view {
  padding: 16px;
}

:deep(.n-data-table .n-data-table-tr.high-risk-row td:not(.n-data-table-td--fixed-right)) {
  background-color: rgba(208, 48, 80, 0.06) !important;
}

:deep(.n-data-table .n-data-table-tr.high-risk-row:hover td:not(.n-data-table-td--fixed-right)) {
  background-color: rgba(208, 48, 80, 0.12) !important;
}

:deep(.n-data-table .n-data-table-tr.high-risk-row.n-data-table-tr--hover td:not(.n-data-table-td--fixed-right)) {
  background-color: rgba(208, 48, 80, 0.12) !important;
}
</style>
