<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NTag,
  NTimePicker,
  NModal,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface TimeSlotRecord {
  id: number
  slotName: string
  startTime: string
  endTime: string
  intervalMinutes: number
  status: number
}

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const editingSlot = ref<TimeSlotRecord | null>(null)

const slotForm = reactive({
  slotName: '',
  startTime: '',
  endTime: '',
  intervalMinutes: 10,
  status: 1
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
]

const columns: DataTableColumns<TimeSlotRecord> = [
  { title: '时间段名称', key: 'slotName', width: 120 },
  { title: '开始时间', key: 'startTime', width: 100 },
  { title: '结束时间', key: 'endTime', width: 100 },
  { title: '间隔分钟', key: 'intervalMinutes', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 80,
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
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' })
        ]
      })
    }
  }
]

const data = ref<TimeSlotRecord[]>([])
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

function fetchData() {
  loading.value = true
  // TODO: 调用API获取时间段列表
  setTimeout(() => {
    data.value = []
    pagination.itemCount = 0
    loading.value = false
  }, 500)
}

function handleAdd() {
  editingSlot.value = null
  Object.assign(slotForm, {
    slotName: '',
    startTime: '',
    endTime: '',
    intervalMinutes: 10,
    status: 1
  })
  showModal.value = true
}

function handleEdit(record: TimeSlotRecord) {
  editingSlot.value = record
  Object.assign(slotForm, {
    slotName: record.slotName,
    startTime: record.startTime,
    endTime: record.endTime,
    intervalMinutes: record.intervalMinutes,
    status: record.status
  })
  showModal.value = true
}

function handleSubmit() {
  // 校验结束时间必须晚于开始时间
  if (slotForm.startTime && slotForm.endTime && slotForm.startTime >= slotForm.endTime) {
    message.error('结束时间必须晚于开始时间')
    return
  }
  // TODO: 调用API创建/更新时间段
  showModal.value = false
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
})
</script>

<template>
  <div class="time-slot-manage-view">
    <n-card title="时间段配置">
      <template #header-extra>
        <n-button type="primary" @click="handleAdd">新增时间段</n-button>
      </template>

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

    <n-modal v-model:show="showModal" preset="card" :title="editingSlot ? '编辑时间段' : '新增时间段'" style="width: 500px">
      <n-form :model="slotForm" label-placement="left" label-width="80">
        <n-form-item label="时间段名称" required>
          <n-input v-model:value="slotForm.slotName" placeholder="请输入时间段名称" />
        </n-form-item>
        <n-form-item label="开始时间" required>
          <n-time-picker v-model:value="slotForm.startTime" format="HH:mm" placeholder="选择开始时间" />
        </n-form-item>
        <n-form-item label="结束时间" required>
          <n-time-picker v-model:value="slotForm.endTime" format="HH:mm" placeholder="选择结束时间" />
        </n-form-item>
        <n-form-item label="间隔分钟">
          <n-input-number v-model:value="slotForm.intervalMinutes" :min="1" placeholder="请输入间隔分钟" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="slotForm.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.time-slot-manage-view {
  padding: 16px;
}
</style>