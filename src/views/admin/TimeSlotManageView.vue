<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NTag,
  NTimePicker,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import DataTablePage from '@/components/ui/DataTablePage.vue'
import FormField from '@/components/ui/FormField.vue'
import { useTablePagination } from '@/composables/useTablePagination'
import { createTimeSlot, pageTimeSlots, updateTimeSlot } from '@/api/admin'
import type { TimeSlotSaveRequest, TimeSlotVO } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const editingSlot = ref<TimeSlotVO | null>(null)

const searchForm = reactive({
  keyword: '',
})

const slotForm = reactive({
  slotName: '',
  startTime: null as string | null,
  endTime: null as string | null,
  intervalMinutes: 10,
  status: 1,
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

const columns: DataTableColumns<TimeSlotVO> = [
  { title: '时间段名称', key: 'slotName', width: 180 },
  { title: '开始时间', key: 'startTime', width: 120 },
  { title: '结束时间', key: 'endTime', width: 120 },
  { title: '间隔分钟', key: 'intervalMinutes', width: 120 },
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
    width: 100,
    fixed: 'right',
    render(row) {
      return h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' })
    },
  },
]

const data = ref<TimeSlotVO[]>([])
const { pagination, setTotal, resetPage, bindRemoteTable } = useTablePagination()

function resetSlotForm() {
  Object.assign(slotForm, {
    slotName: '',
    startTime: null,
    endTime: null,
    intervalMinutes: 10,
    status: 1,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageTimeSlots({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    })
    data.value = result.records
    setTotal(result.total)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载时间段失败')
  } finally {
    loading.value = false
  }
}

const { onUpdatePage, onUpdatePageSize } = bindRemoteTable(fetchData)

function handleSearch() {
  resetPage()
  void fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  handleSearch()
}

function handleAdd() {
  editingSlot.value = null
  resetSlotForm()
  showModal.value = true
}

function handleEdit(record: TimeSlotVO) {
  editingSlot.value = record
  Object.assign(slotForm, {
    slotName: record.slotName,
    startTime: record.startTime,
    endTime: record.endTime,
    intervalMinutes: record.intervalMinutes,
    status: record.status,
  })
  showModal.value = true
}

async function handleSubmit() {
  if (!slotForm.slotName.trim()) {
    message.warning('请输入时间段名称')
    return
  }
  if (!slotForm.startTime || !slotForm.endTime) {
    message.warning('请选择开始时间和结束时间')
    return
  }
  if (slotForm.startTime >= slotForm.endTime) {
    message.warning('结束时间必须晚于开始时间')
    return
  }
  if (slotForm.intervalMinutes < 1) {
    message.warning('间隔分钟必须大于 0')
    return
  }

  const payload: TimeSlotSaveRequest = {
    slotName: slotForm.slotName,
    startTime: slotForm.startTime,
    endTime: slotForm.endTime,
    intervalMinutes: slotForm.intervalMinutes,
    status: slotForm.status,
  }

  submitting.value = true
  try {
    if (editingSlot.value) {
      await updateTimeSlot(editingSlot.value.id, payload)
      message.success('时间段已更新')
    } else {
      await createTimeSlot(payload)
      message.success('时间段已创建')
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存时间段失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div>
    <DataTablePage
      title="时间段配置"
      description="配置初访与正式咨询可用的时间段、起止时刻与预约间隔。"
      table-title="时间段列表"
      :loading="loading"
      :columns="columns"
      :data="data"
      :pagination="pagination"
      :scroll-x="760"
      :row-key="(row: TimeSlotVO) => row.id"
      empty-title="暂无时间段"
      @search="handleSearch"
      @reset="handleReset"
      @update:page="onUpdatePage"
      @update:page-size="onUpdatePageSize"
    >
      <template #header-actions>
        <n-button type="primary" @click="handleAdd">新增时间段</n-button>
      </template>
      <template #search>
        <FormField label="关键词">
          <n-input
            v-model:value="searchForm.keyword"
            placeholder="时间段名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </FormField>
      </template>
    </DataTablePage>

    <n-modal v-model:show="showModal" preset="card" :title="editingSlot ? '编辑时间段' : '新增时间段'" style="width: 560px">
      <n-form :model="slotForm" label-placement="left" label-width="90">
        <n-form-item label="时间段名称" required>
          <n-input v-model:value="slotForm.slotName" placeholder="请输入时间段名称" />
        </n-form-item>
        <n-form-item label="开始时间" required>
          <n-time-picker
            v-model:formatted-value="slotForm.startTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择开始时间"
          />
        </n-form-item>
        <n-form-item label="结束时间" required>
          <n-time-picker
            v-model:formatted-value="slotForm.endTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择结束时间"
          />
        </n-form-item>
        <n-form-item label="间隔分钟">
          <n-input-number v-model:value="slotForm.intervalMinutes" :min="1" placeholder="请输入间隔分钟" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="slotForm.status" :options="statusOptions" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
