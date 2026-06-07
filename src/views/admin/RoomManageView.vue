<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import { createRoom, pageRooms, updateRoom } from '@/api/admin'
import type { RoomSaveRequest, RoomVO } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const editingRoom = ref<RoomVO | null>(null)

const roomForm = reactive<RoomSaveRequest>({
  roomName: '',
  location: '',
  capacity: 1,
  status: 1,
  remark: '',
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
]

const columns: DataTableColumns<RoomVO> = [
  { title: '咨询室名称', key: 'roomName', width: 180 },
  { title: '地点', key: 'location', width: 220 },
  { title: '容量', key: 'capacity', width: 90 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '停用' })
    },
  },
  { title: '备注', key: 'remark', minWidth: 220 },
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

const data = ref<RoomVO[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

function resetRoomForm() {
  Object.assign(roomForm, {
    roomName: '',
    location: '',
    capacity: 1,
    status: 1,
    remark: '',
  })
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageRooms({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询室失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  editingRoom.value = null
  resetRoomForm()
  showModal.value = true
}

function handleEdit(record: RoomVO) {
  editingRoom.value = record
  Object.assign(roomForm, {
    roomName: record.roomName,
    location: record.location,
    capacity: record.capacity,
    status: record.status,
    remark: record.remark,
  })
  showModal.value = true
}

async function handleSubmit() {
  if (!roomForm.roomName.trim()) {
    message.warning('请输入咨询室名称')
    return
  }
  if (roomForm.capacity < 1) {
    message.warning('容量必须大于 0')
    return
  }

  submitting.value = true
  try {
    if (editingRoom.value) {
      await updateRoom(editingRoom.value.id, roomForm)
      message.success('咨询室信息已更新')
    } else {
      await createRoom(roomForm)
      message.success('咨询室已创建')
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存咨询室失败')
  } finally {
    submitting.value = false
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

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div class="room-manage-view">
    <n-card title="咨询室管理">
      <template #header-extra>
        <n-button type="primary" @click="handleAdd">新增咨询室</n-button>
      </template>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="900"
        remote
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="editingRoom ? '编辑咨询室' : '新增咨询室'" style="width: 560px">
      <n-form :model="roomForm" label-placement="left" label-width="90">
        <n-form-item label="咨询室名称" required>
          <n-input v-model:value="roomForm.roomName" placeholder="请输入咨询室名称" />
        </n-form-item>
        <n-form-item label="地点">
          <n-input v-model:value="roomForm.location" placeholder="请输入地点" />
        </n-form-item>
        <n-form-item label="容量">
          <n-input-number v-model:value="roomForm.capacity" :min="1" placeholder="请输入容量" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="roomForm.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="roomForm.remark" type="textarea" placeholder="请输入备注" />
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

<style scoped>
.room-manage-view {
  padding: 16px;
}
</style>
