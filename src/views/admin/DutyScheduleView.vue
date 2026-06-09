<script setup lang="ts">
import { h, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInputNumber,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import {
  batchCreateDutySchedulesReal,
  createDutyScheduleReal,
  getRoomOptionsReal,
  getStaffOptionsReal,
  getStaffTypeLabel,
  getTimeSlotOptionsReal,
  pageDutySchedulesReal,
  updateDutyScheduleReal,
} from '@/api/admin'
import type {
  DutyScheduleVO,
  OptionItem,
  RealDutyScheduleVO,
} from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const batchSubmitting = ref(false)
const showModal = ref(false)
const showBatchModal = ref(false)
const editingSchedule = ref<RealDutyScheduleVO | null>(null)

const searchForm = reactive({
  staffType: null as string | null,
  staffId: null as number | null,
  dateRange: null as [string, string] | null,
  status: null as number | null,
})

const scheduleForm = reactive({
  staffType: 'INTERVIEWER',
  staffId: null as number | null,
  dutyDate: null as string | null,
  slotId: null as number | null,
  roomId: null as number | null,
  capacity: 2,
  status: 1,
})

const batchForm = reactive({
  staffType: 'INTERVIEWER',
  staffId: null as number | null,
  dateRange: null as [string, string] | null,
  weekdays: [] as number[],
  slotIds: [] as number[],
  roomId: null as number | null,
  capacity: 2,
})

const staffTypeOptions = [
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '咨询师', value: 'COUNSELOR' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

const weekdayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
]

const searchStaffOptions = ref<OptionItem[]>([])
const formStaffOptions = ref<OptionItem[]>([])
const batchStaffOptions = ref<OptionItem[]>([])
const slotOptions = ref<OptionItem[]>([])
const roomOptions = ref<OptionItem[]>([])

const columns: DataTableColumns<RealDutyScheduleVO> = [
  { title: '日期', key: 'dutyDate', width: 110 },
  { title: '时间段', key: 'slotName', width: 170 },
  { title: '工作人员', key: 'staffName', width: 120 },
  {
    title: '类型',
    key: 'staffType',
    width: 100,
    render(row) {
      return h(NTag, { type: 'info' }, { default: () => getStaffTypeLabel(row.staffType) })
    },
  },
  { title: '地点', key: 'roomName', width: 140 },
  { title: '容量', key: 'capacity', width: 70 },
  { title: '已预约', key: 'reservedCount', width: 80 },
  { title: '剩余', key: 'remaining', width: 70 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '停用' })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
          h(
            NPopconfirm,
            { onPositiveClick: () => handleToggleStatus(row) },
            {
              trigger: () => h(
                NButton,
                { size: 'small', type: row.status === 1 ? 'error' : 'success' },
                { default: () => row.status === 1 ? '停用' : '启用' },
              ),
              default: () => `确定${row.status === 1 ? '停用' : '启用'}该值班安排吗？`,
            },
          ),
        ],
      })
    },
  },
]

const data = ref<RealDutyScheduleVO[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

function resetScheduleForm() {
  Object.assign(scheduleForm, {
    staffType: 'INTERVIEWER',
    staffId: null,
    dutyDate: null,
    slotId: null,
    roomId: null,
    capacity: 2,
    status: 1,
  })
}

function resetBatchForm() {
  Object.assign(batchForm, {
    staffType: 'INTERVIEWER',
    staffId: null,
    dateRange: null,
    weekdays: [],
    slotIds: [],
    roomId: null,
    capacity: 2,
  })
}

function syncSelectedStaffId(options: OptionItem[], currentValue: number | null) {
  return currentValue != null && options.some(option => option.value === currentValue)
    ? currentValue
    : null
}

async function fetchData() {
  loading.value = true
  try {
    const { data: result } = await pageDutySchedulesReal({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      staffType: searchForm.staffType ?? undefined,
      staffId: searchForm.staffId ?? undefined,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      status: searchForm.status ?? undefined,
    })
    data.value = result.data.records
    pagination.itemCount = result.data.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载值班安排失败')
  } finally {
    loading.value = false
  }
}

async function loadSearchStaffOptions() {
  try {
    const { data: result } = await getStaffOptionsReal(searchForm.staffType ?? undefined)
    searchStaffOptions.value = result.data
    searchForm.staffId = syncSelectedStaffId(searchStaffOptions.value, searchForm.staffId)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载工作人员选项失败')
  }
}

async function loadFormStaffOptions() {
  try {
    const { data: result } = await getStaffOptionsReal(scheduleForm.staffType)
    formStaffOptions.value = result.data
    scheduleForm.staffId = syncSelectedStaffId(formStaffOptions.value, scheduleForm.staffId)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载工作人员选项失败')
  }
}

async function loadBatchStaffOptions() {
  try {
    const { data: result } = await getStaffOptionsReal(batchForm.staffType)
    batchStaffOptions.value = result.data
    batchForm.staffId = syncSelectedStaffId(batchStaffOptions.value, batchForm.staffId)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载工作人员选项失败')
  }
}

async function loadSlotOptions() {
  try {
    const { data: result } = await getTimeSlotOptionsReal()
    slotOptions.value = result.data
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载时间段选项失败')
  }
}

async function loadRoomOptions() {
  try {
    const { data: result } = await getRoomOptionsReal()
    roomOptions.value = result.data
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询室选项失败')
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchData()
}

function handleReset() {
  searchForm.staffType = null
  searchForm.staffId = null
  searchForm.dateRange = null
  searchForm.status = null
  void loadSearchStaffOptions()
  handleSearch()
}

async function handleAdd() {
  editingSchedule.value = null
  resetScheduleForm()
  showModal.value = true
  await loadFormStaffOptions()
}

async function handleEdit(record: RealDutyScheduleVO) {
  editingSchedule.value = record
  Object.assign(scheduleForm, {
    staffType: record.staffType,
    staffId: record.staffId,
    dutyDate: record.dutyDate,
    slotId: record.slotId,
    roomId: record.roomId,
    capacity: record.capacity,
    status: record.status,
  })
  showModal.value = true
  await loadFormStaffOptions()
}

async function handleToggleStatus(record: RealDutyScheduleVO) {
  const payload = {
    staffId: record.staffId,
    staffType: record.staffType,
    dutyDate: record.dutyDate,
    slotId: record.slotId,
    roomId: record.roomId,
    capacity: record.capacity,
    status: record.status === 1 ? 0 : 1,
  }

  try {
    await updateDutyScheduleReal(record.id, payload)
    message.success(record.status === 1 ? '值班已停用' : '值班已启用')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '更新值班状态失败')
  }
}

function handleBatchAdd() {
  resetBatchForm()
  showBatchModal.value = true
  void loadBatchStaffOptions()
}

async function handleSubmit() {
  if (!scheduleForm.staffId) {
    message.warning('请选择工作人员')
    return
  }
  if (!scheduleForm.dutyDate) {
    message.warning('请选择值班日期')
    return
  }
  if (!scheduleForm.slotId) {
    message.warning('请选择时间段')
    return
  }
  if (scheduleForm.capacity < 1) {
    message.warning('容量必须大于 0')
    return
  }

  const payload = {
    staffId: scheduleForm.staffId,
    staffType: scheduleForm.staffType,
    dutyDate: scheduleForm.dutyDate,
    slotId: scheduleForm.slotId,
    roomId: scheduleForm.roomId ?? undefined,
    capacity: scheduleForm.capacity,
    status: scheduleForm.status,
  }

  submitting.value = true
  try {
    if (editingSchedule.value) {
      await updateDutyScheduleReal(editingSchedule.value.id, payload)
      message.success('值班安排已更新')
    } else {
      await createDutyScheduleReal(payload)
      message.success('值班安排已创建')
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存值班安排失败')
  } finally {
    submitting.value = false
  }
}

async function handleBatchSubmit() {
  if (!batchForm.staffId) {
    message.warning('请选择工作人员')
    return
  }
  if (!batchForm.dateRange) {
    message.warning('请选择日期范围')
    return
  }
  if (batchForm.weekdays.length === 0) {
    message.warning('请至少选择一个星期')
    return
  }
  if (batchForm.slotIds.length === 0) {
    message.warning('请至少选择一个时间段')
    return
  }
  if (batchForm.capacity < 1) {
    message.warning('容量必须大于 0')
    return
  }

  const payload = {
    staffId: batchForm.staffId,
    staffType: batchForm.staffType,
    startDate: batchForm.dateRange[0],
    endDate: batchForm.dateRange[1],
    weekdays: [...batchForm.weekdays],
    slotIds: [...batchForm.slotIds],
    roomId: batchForm.roomId ?? undefined,
    capacity: batchForm.capacity,
  }

  batchSubmitting.value = true
  try {
    const { data: result } = await batchCreateDutySchedulesReal(payload)
    const { createdCount, skippedCount, conflicts } = result.data
    if (skippedCount > 0) {
      const firstConflict = conflicts?.[0]
      const conflictSummary = firstConflict
        ? `；例如 ${firstConflict.date} 第 ${firstConflict.slotId} 个时间段：${firstConflict.reason}`
        : ''
      message.warning(`已创建 ${createdCount} 条，跳过 ${skippedCount} 条冲突记录${conflictSummary}`)
    } else {
      message.success(`已批量创建 ${createdCount} 条值班安排`)
    }
    showBatchModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '批量排班失败')
  } finally {
    batchSubmitting.value = false
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  void fetchData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  void fetchData()
}

watch(() => searchForm.staffType, () => {
  void loadSearchStaffOptions()
})

watch(() => scheduleForm.staffType, () => {
  void loadFormStaffOptions()
})

watch(() => batchForm.staffType, () => {
  void loadBatchStaffOptions()
})

onMounted(async () => {
  await Promise.all([
    loadSearchStaffOptions(),
    loadFormStaffOptions(),
    loadBatchStaffOptions(),
    loadSlotOptions(),
    loadRoomOptions(),
    fetchData(),
  ])
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
          <n-select v-model:value="searchForm.staffId" :options="searchStaffOptions" placeholder="选择工作人员" clearable />
        </n-form-item>
        <n-form-item label="日期范围">
          <n-date-picker
            v-model:formatted-value="searchForm.dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            clearable
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="选择状态" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">搜索</n-button>
            <n-button @click="handleReset">重置</n-button>
            <n-button tertiary type="primary" @click="handleAdd">新增值班</n-button>
            <n-button tertiary @click="handleBatchAdd">批量排班</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1140"
        remote
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="editingSchedule ? '编辑值班' : '新增值班'" style="width: 640px">
      <n-form :model="scheduleForm" label-placement="left" label-width="90">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="类型" required>
              <n-select v-model:value="scheduleForm.staffType" :options="staffTypeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工作人员" required>
              <n-select v-model:value="scheduleForm.staffId" :options="formStaffOptions" placeholder="选择工作人员" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="日期" required>
              <n-date-picker
                v-model:formatted-value="scheduleForm.dutyDate"
                type="date"
                value-format="yyyy-MM-dd"
                clearable
              />
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
              <n-input-number v-model:value="scheduleForm.capacity" :min="1" style="width: 100%" />
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
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showBatchModal" preset="card" title="批量排班" style="width: 720px">
      <n-form :model="batchForm" label-placement="left" label-width="90">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="类型" required>
              <n-select v-model:value="batchForm.staffType" :options="staffTypeOptions" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工作人员" required>
              <n-select v-model:value="batchForm.staffId" :options="batchStaffOptions" placeholder="选择工作人员" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="日期范围" required>
              <n-date-picker
                v-model:formatted-value="batchForm.dateRange"
                type="daterange"
                value-format="yyyy-MM-dd"
                clearable
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="周几" required>
              <n-checkbox-group v-model:value="batchForm.weekdays">
                <n-space>
                  <n-checkbox v-for="option in weekdayOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </n-checkbox>
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
              <n-input-number v-model:value="batchForm.capacity" :min="1" style="width: 100%" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchModal = false">取消</n-button>
          <n-button type="primary" :loading="batchSubmitting" @click="handleBatchSubmit">确定</n-button>
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
