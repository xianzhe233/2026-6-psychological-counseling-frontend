<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NSpace,
  NTag,
  NDrawer,
  NDrawerContent,
  NDescriptions,
  NDescriptionsItem,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NRadioGroup,
  NRadio,
  useMessage,
  useDialog
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  pageAuditAppointments,
  getAuditAppointmentDetail,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  markPriority
} from '@/api/admin'
import type {
  AppointmentAuditVO,
  AppointmentDetailVO,
  ApproveAppointmentRequest,
  RejectAppointmentRequest,
  RescheduleAppointmentRequest
} from '@/api/admin'
import { getStaffOptions } from '@/api/admin'
import { pageDutySchedules } from '@/api/admin'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// 搜索条件
const searchForm = reactive({
  keyword: '',
  status: null as string | null,
  riskLevel: null as string | null,
  dateRange: null as [string, string] | null,
  priorityFlag: null as number | null
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
const tableData = ref<AppointmentAuditVO[]>([])

// 详情抽屉
const detailDrawerVisible = ref(false)
const detailData = ref<AppointmentDetailVO | null>(null)

// 审核弹窗
const approveModalVisible = ref(false)
const rejectModalVisible = ref(false)
const rescheduleModalVisible = ref(false)

// 当前操作的预约ID
const currentAppointmentId = ref<number | null>(null)

// 审核表单
const approveForm = reactive<ApproveAppointmentRequest>({
  dutyScheduleId: 0,
  interviewerId: 0,
  appointmentDate: '',
  slotId: 0,
  roomId: undefined,
  auditRemark: ''
})

const rejectForm = reactive<RejectAppointmentRequest>({
  reason: ''
})

const rescheduleForm = reactive<RescheduleAppointmentRequest>({
  dutyScheduleId: 0,
  interviewerId: 0,
  appointmentDate: '',
  slotId: 0,
  roomId: undefined,
  auditRemark: ''
})

// 选项数据
const statusOptions = [
  { label: '待处理', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELED' },
  { label: '已完成', value: 'COMPLETED' }
]

const riskLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' }
]

const priorityOptions = [
  { label: '全部', value: null },
  { label: '优先', value: 1 },
  { label: '普通', value: 0 }
]

// 表格列定义
const columns: DataTableColumns<AppointmentAuditVO> = [
  {
    title: '预约编号',
    key: 'appointmentNo',
    width: 150
  },
  {
    title: '学号',
    key: 'studentNo',
    width: 120
  },
  {
    title: '姓名',
    key: 'studentName',
    width: 100
  },
  {
    title: '院系',
    key: 'college',
    width: 150
  },
  {
    title: '主要困扰',
    key: 'mainProblem',
    width: 200,
    ellipsis: {
      tooltip: true
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
    title: '预约时间',
    key: 'appointmentDate',
    width: 180,
    render(row) {
      return `${row.appointmentDate} ${row.slotName}`
    }
  },
  {
    title: '初访员',
    key: 'interviewerName',
    width: 100,
    render(row) {
      return row.interviewerName || '待分配'
    }
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
    title: '状态',
    key: 'appointmentStatus',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.appointmentStatus })
    }
  },
  {
    title: '优先',
    key: 'priorityFlag',
    width: 80,
    render(row) {
      return row.priorityFlag === 1
        ? h(NTag, { type: 'warning', round: true }, () => '优先')
        : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleViewDetail(row.id)
          },
          () => '查看'
        ),
        row.appointmentStatus === 'PENDING'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'success',
                onClick: () => handleApprove(row.id)
              },
              () => '通过'
            )
          : null,
        row.appointmentStatus === 'PENDING'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'error',
                onClick: () => handleReject(row.id)
              },
              () => '驳回'
            )
          : null,
        row.appointmentStatus === 'PENDING' || row.appointmentStatus === 'APPROVED'
          ? h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                onClick: () => handleReschedule(row.id)
              },
              () => '改约'
            )
          : null,
        row.appointmentStatus === 'PENDING' && row.priorityFlag === 0
          ? h(
              NButton,
              {
                size: 'small',
                type: 'info',
                onClick: () => handleMarkPriority(row.id)
              },
              () => '优先'
            )
          : null
      ])
    }
  }
]

// 行样式 - 高风险高亮
const rowClassName = (row: AppointmentAuditVO) => {
  if (row.riskLevel === 'HIGH' || row.riskLevel === 'URGENT') {
    return 'high-risk-row'
  }
  return ''
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.riskLevel) params.riskLevel = searchForm.riskLevel
    if (searchForm.priorityFlag !== null) params.priorityFlag = searchForm.priorityFlag
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const res = await pageAuditAppointments(params)
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
  searchForm.keyword = ''
  searchForm.status = null
  searchForm.riskLevel = null
  searchForm.dateRange = null
  searchForm.priorityFlag = null
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
const handleViewDetail = async (id: number) => {
  try {
    const res = await getAuditAppointmentDetail(id)
    detailData.value = res.data.data
    detailDrawerVisible.value = true
  } catch (error: any) {
    message.error(error.message || '获取详情失败')
  }
}

// 通过预约
const handleApprove = (id: number) => {
  currentAppointmentId.value = id
  approveForm.dutyScheduleId = 0
  approveForm.interviewerId = 0
  approveForm.appointmentDate = ''
  approveForm.slotId = 0
  approveForm.roomId = undefined
  approveForm.auditRemark = ''
  approveModalVisible.value = true
}

// 驳回预约
const handleReject = (id: number) => {
  currentAppointmentId.value = id
  rejectForm.reason = ''
  rejectModalVisible.value = true
}

// 改约
const handleReschedule = (id: number) => {
  currentAppointmentId.value = id
  rescheduleForm.dutyScheduleId = 0
  rescheduleForm.interviewerId = 0
  rescheduleForm.appointmentDate = ''
  rescheduleForm.slotId = 0
  rescheduleForm.roomId = undefined
  rescheduleForm.auditRemark = ''
  rescheduleModalVisible.value = true
}

// 标记优先
const handleMarkPriority = async (id: number) => {
  dialog.warning({
    title: '确认标记优先',
    content: '确认将该预约标记为优先处理？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await markPriority(id)
        message.success('标记成功')
        loadData()
      } catch (error: any) {
        message.error(error.message || '标记失败')
      }
    }
  })
}

// 确认通过
const handleApproveConfirm = async () => {
  if (!currentAppointmentId.value) return
  if (approveForm.interviewerId <= 0 || !approveForm.appointmentDate || approveForm.slotId <= 0) {
    message.error('请填写必填信息')
    return
  }

  dialog.success({
    title: '确认通过',
    content: '确认通过该预约申请？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await approveAppointment(currentAppointmentId.value!, approveForm)
        message.success('审核通过')
        approveModalVisible.value = false
        loadData()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    }
  })
}

// 确认驳回
const handleRejectConfirm = async () => {
  if (!currentAppointmentId.value) return
  if (!rejectForm.reason) {
    message.error('请填写驳回原因')
    return
  }

  dialog.error({
    title: '确认驳回',
    content: '确认驳回该预约申请？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await rejectAppointment(currentAppointmentId.value!, rejectForm)
        message.success('已驳回')
        rejectModalVisible.value = false
        loadData()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    }
  })
}

// 确认改约
const handleRescheduleConfirm = async () => {
  if (!currentAppointmentId.value) return
  if (rescheduleForm.interviewerId <= 0 || !rescheduleForm.appointmentDate || rescheduleForm.slotId <= 0) {
    message.error('请填写必填信息')
    return
  }

  dialog.warning({
    title: '确认改约',
    content: '确认修改该预约时间？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await rescheduleAppointment(currentAppointmentId.value!, rescheduleForm)
        message.success('改约成功')
        rescheduleModalVisible.value = false
        loadData()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="appointment-audit-view">
    <n-card title="初访预约审核">
      <!-- 搜索区 -->
      <n-space vertical :size="16">
        <n-space>
          <n-input
            v-model:value="searchForm.keyword"
            placeholder="搜索学号/姓名/预约编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <n-select
            v-model:value="searchForm.status"
            :options="statusOptions"
            placeholder="预约状态"
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
          <n-select
            v-model:value="searchForm.priorityFlag"
            :options="priorityOptions"
            placeholder="优先标记"
            clearable
            style="width: 120px"
          />
          <n-date-picker
            v-model:value="searchForm.dateRange"
            type="daterange"
            clearable
            style="width: 300px"
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
          :row-class-name="rowClassName"
          :scroll-x="1500"
          remote
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
    </n-card>

    <!-- 详情抽屉 -->
    <n-drawer v-model:show="detailDrawerVisible" :width="600">
      <n-drawer-content title="预约详情">
        <template v-if="detailData">
          <n-descriptions label-placement="left" bordered :column="1">
            <n-descriptions-item label="预约编号">
              {{ detailData.appointmentNo }}
            </n-descriptions-item>
            <n-descriptions-item label="学生姓名">
              {{ detailData.studentName }}
            </n-descriptions-item>
            <n-descriptions-item label="学号">
              {{ detailData.studentNo }}
            </n-descriptions-item>
            <n-descriptions-item label="院系">
              {{ detailData.college || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="联系电话">
              {{ detailData.phone || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="主要困扰">
              {{ detailData.mainProblem }}
            </n-descriptions-item>
            <n-descriptions-item label="问题描述">
              {{ detailData.problemDescription || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="期望帮助">
              {{ detailData.expectedHelp || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="风险评分">
              {{ detailData.riskScore }}
            </n-descriptions-item>
            <n-descriptions-item label="风险等级">
              <risk-tag :value="detailData.riskLevel" />
            </n-descriptions-item>
            <n-descriptions-item label="情绪困扰">
              {{ detailData.moodScore }}/10
            </n-descriptions-item>
            <n-descriptions-item label="睡眠困扰">
              {{ detailData.sleepScore }}/10
            </n-descriptions-item>
            <n-descriptions-item label="压力程度">
              {{ detailData.stressScore }}/10
            </n-descriptions-item>
            <n-descriptions-item label="自伤倾向">
              {{ detailData.selfHarmFlag === 1 ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="紧急求助">
              {{ detailData.emergencyFlag === 1 ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="预约时间">
              {{ detailData.appointmentDate }} {{ detailData.slotName }}
            </n-descriptions-item>
            <n-descriptions-item label="初访员">
              {{ detailData.interviewerName || '待分配' }}
            </n-descriptions-item>
            <n-descriptions-item label="地点">
              {{ detailData.roomName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="状态">
              <status-tag :value="detailData.appointmentStatus" />
            </n-descriptions-item>
            <n-descriptions-item label="优先标记">
              {{ detailData.priorityFlag === 1 ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="审核备注">
              {{ detailData.auditRemark || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="审核时间">
              {{ detailData.auditTime || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="审核人">
              {{ detailData.auditorName || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="提交时间">
              {{ detailData.createTime }}
            </n-descriptions-item>
          </n-descriptions>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 通过弹窗 -->
    <n-modal
      v-model:show="approveModalVisible"
      title="审核通过"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleApproveConfirm"
    >
      <n-form :model="approveForm" label-placement="left" label-width="80">
        <n-form-item label="初访员" required>
          <n-input-number v-model:value="approveForm.interviewerId" placeholder="请输入初访员ID" />
        </n-form-item>
        <n-form-item label="预约日期" required>
          <n-input v-model:value="approveForm.appointmentDate" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="时间段" required>
          <n-input-number v-model:value="approveForm.slotId" placeholder="请输入时间段ID" />
        </n-form-item>
        <n-form-item label="咨询室">
          <n-input-number v-model:value="approveForm.roomId" placeholder="请输入咨询室ID" />
        </n-form-item>
        <n-form-item label="审核备注">
          <n-input v-model:value="approveForm.auditRemark" type="textarea" placeholder="请输入备注" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 驳回弹窗 -->
    <n-modal
      v-model:show="rejectModalVisible"
      title="驳回预约"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleRejectConfirm"
    >
      <n-form :model="rejectForm" label-placement="left" label-width="80">
        <n-form-item label="驳回原因" required>
          <n-input v-model:value="rejectForm.reason" type="textarea" placeholder="请输入驳回原因" />
        </n-form-item>
      </n-form>
    </n-modal>

    <!-- 改约弹窗 -->
    <n-modal
      v-model:show="rescheduleModalVisible"
      title="改约"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="handleRescheduleConfirm"
    >
      <n-form :model="rescheduleForm" label-placement="left" label-width="80">
        <n-form-item label="初访员" required>
          <n-input-number v-model:value="rescheduleForm.interviewerId" placeholder="请输入初访员ID" />
        </n-form-item>
        <n-form-item label="预约日期" required>
          <n-input v-model:value="rescheduleForm.appointmentDate" placeholder="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="时间段" required>
          <n-input-number v-model:value="rescheduleForm.slotId" placeholder="请输入时间段ID" />
        </n-form-item>
        <n-form-item label="咨询室">
          <n-input-number v-model:value="rescheduleForm.roomId" placeholder="请输入咨询室ID" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="rescheduleForm.auditRemark" type="textarea" placeholder="请输入备注" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<style scoped>
.appointment-audit-view {
  padding: 16px;
}

:deep(.high-risk-row) {
  background-color: rgba(255, 0, 0, 0.05) !important;
}

:deep(.high-risk-row:hover) {
  background-color: rgba(255, 0, 0, 0.1) !important;
}
</style>
