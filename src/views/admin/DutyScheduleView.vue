<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  NDatePicker,
  NModal,
  NGrid,
  NGi,
  NCheckboxGroup,
  NCheckbox,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface DutyScheduleRecord {
  id: number
  staffId: number
  staffName: string
  staffType: string
  dutyDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId: number
  roomName: string
  capacity: number
  reservedCount: number
  remaining: number
  status: number
}

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const showBatchModal = ref(false)
const editingSchedule = ref<DutyScheduleRecord | null>(null)

const searchForm = reactive({
  staffType: '',
  staffId: null as number | null,
  dateRange: null as [string, string] | null,
  status: null as number | null
})

const scheduleForm = reactive({
  staffType: 'INTERVIEWER',
  staffId: null as number | null,
  dutyDate: '',
  slotId: null as number | null,
  roomId: null as number | null,
  capacity: 2,
  status: 1
})

const batchForm = reactive({
  staffType: 'INTERVIEWER',
  staffId: null as number | null,
  dateRange: null as [string, string] | null,
  weekdays: [] as number[],
  slotIds: [] as number[],
  roomId: null as number | null,
  capacity: 2
})

const staffTypeOptions = [
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '咨询师', value: 'COUNSELOR' }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
]

const weekdayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 }
]

const staffOptions = ref<{ label: string; value: number }[]>([])
const slotOptions = ref<{ label: string; value: number }[]>([])
const roomOptions = ref<{ label: string; value: number }[]>([])

const columns: DataTableColumns<DutyScheduleRecord> = [
  { title: '日期', key: 'dutyDate', width: 100 },
  { title: '时间段', key: 'slotName', width: 120 },
  { title: '工作人员', key: 'staffName', width: 100 },
  {
    title: '类型',
    key: 'staffType',
    width: 80,
    render(row) {
      const typeMap: Record<string, string> = {
        INTERVIEWER: '初访员',
        COUNSELOR: '咨询师'
      }
      return h(NTag, { type: 'info' }, { default: () => typeMap[row.staffType] || row.staffType })
    }
  },
  { title: '地点', key: 'roomName', width: 120 },
  { title: '容量', key: 'capacity', width: 60 },
  { title: '已预约', key: 'reservedCount', width: 70 },
  { title: '剩余', key: 'remaining', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 70,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '停用' })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: row.status === 1 ? 'error' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '停用' : '启用' })
        ]
      })
    }
  }
]

const data = ref<DutyScheduleRecord[]>([])
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

function fetchData() {
  loading.value = true
  // TODO: 调用API获取值班列表
  setTimeout(() => {
    data.value = []
    pagination.itemCount = 0
    loading.value = false
  }, 500)
}

function fetchStaffOptions() {
  // TODO: 调用API获取工作人员选项
  staffOptions.value = []
}

function fetchSlotOptions() {
  // TODO: 调用API获取时间段选项
  slotOptions.value = []
}

function fetchRoomOptions() {
  // TODO: 调用API获取咨询室选项
  roomOptions.value = []
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  editingSchedule.value = null
  Object.assign(scheduleForm, {
    staffType: 'INTERVIEWER',
    staffId: null,
    dutyDate: '',
    slotId: null,
    roomId: null,
    capacity: 2,
    status: 1
  })
  showModal.value = true
}

function handleEdit(record: DutyScheduleRecord) {
  editingSchedule.value = record
  Object.assign(scheduleForm, {
    staffType: record.staffType,
    staffId: record.staffId,
    dutyDate: record.dutyDate,
    slotId: record.slotId,
    roomId: record.roomId,
    capacity: record.capacity,
    status: record.status
  })
  showModal.value = true
}

function handleToggleStatus(record: DutyScheduleRecord) {
  // TODO: 调用API启用/停用值班
  message.success(record.status === 1 ? '已停用' : '已启用')
  fetchData()
}

function handleBatchAdd() {
  Object.assign(batchForm, {
    staffType: 'INTERVIEWER',
    staffId: null,
    dateRange: null,
    weekdays: [],
    slotIds: [],
    roomId: null,
    capacity: 2
  })
  showBatchModal.value = true
}

function handleSubmit() {
  // TODO: 调用API创建/更新值班
  showModal.value = false
  fetchData()
}

function handleBatchSubmit() {
  // TODO: 调用API批量排班
  showBatchModal.value = false
  fetchData()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchStaffOptions()
  fetchSlotOptions()
  fetchRoomOptions()
})
</script>

<template>
  <div class="duty-schedule-view">
    <n-card title="值班管理">
      <n-form inline :model="searchForm" @submit.prevent="handleSearch">
        <n-form-item label="类型">
          <n-select v-model:value="searchForm.staffType" :options="staffTypeOptions" placeholder="选择类型" clearable />
        </n-form-item>
        <n-form-item label="工作人员">
          <n-select v-model:value="searchForm.staffId" :options="staffOptions" placeholder="选择工作人员" clearable />
        </n-form-item>
        <n-form-item label="日期范围">
          <n-date-picker v-model:value="searchForm.dateRange" type="daterange" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="选择状态" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">搜索</n-button>
            <n-button @click="handleAdd">新增值班</n-button>
            <n-button @click="handleBatchAdd">批量排班</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        remote
        striped
      />
    </n-card>

    <!-- 新增/编辑值班弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="editingSchedule ? '编辑值班' : '新增值班'" style="width: 600px">
      <n-form :model="scheduleForm" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="类型" required>
              <n-select v-model:value="scheduleForm.staffType" :options="staffTypeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工作人员" required>
              <n-select v-model:value="scheduleForm.staffId" :options="staffOptions" placeholder="选择工作人员" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="日期" required>
              <n-date-picker v-model:value="scheduleForm.dutyDate" type="date" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="时间段" required>
              <n-select v-model:value="scheduleForm.slotId" :options="slotOptions" placeholder="选择时间段" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="咨询室">
              <n-select v-model:value="scheduleForm.roomId" :options="roomOptions" placeholder="选择咨询室" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="容量" required>
              <n-input-number v-model:value="scheduleForm.capacity" :min="1" placeholder="请输入容量" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="scheduleForm.status" :options="statusOptions" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量排班弹窗 -->
    <n-modal v-model:show="showBatchModal" preset="card" title="批量排班" style="width: 700px">
      <n-form :model="batchForm" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="类型" required>
              <n-select v-model:value="batchForm.staffType" :options="staffTypeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工作人员" required>
              <n-select v-model:value="batchForm.staffId" :options="staffOptions" placeholder="选择工作人员" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="日期范围" required>
              <n-date-picker v-model:value="batchForm.dateRange" type="daterange" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="周几" required>
              <n-checkbox-group v-model:value="batchForm.weekdays">
                <n-space>
                  <n-checkbox v-for="option in weekdayOptions" :key="option.value" :value="option.value" :label="option.label" />
                </n-space>
              </n-checkbox-group>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="时间段" required>
              <n-select v-model:value="batchForm.slotIds" :options="slotOptions" multiple placeholder="选择时间段" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="咨询室">
              <n-select v-model:value="batchForm.roomId" :options="roomOptions" placeholder="选择咨询室" clearable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="容量" required>
              <n-input-number v-model:value="batchForm.capacity" :min="1" placeholder="请输入容量" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.duty-schedule-view {
  padding: 16px;
}
</style>