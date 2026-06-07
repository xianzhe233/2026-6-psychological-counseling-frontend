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
  NModal,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface RoomRecord {
  id: number
  roomName: string
  location: string
  capacity: number
  status: number
  remark: string
}

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const editingRoom = ref<RoomRecord | null>(null)

const roomForm = reactive({
  roomName: '',
  location: '',
  capacity: 1,
  status: 1,
  remark: ''
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
]

const columns: DataTableColumns<RoomRecord> = [
  { title: '咨询室名称', key: 'roomName', width: 150 },
  { title: '地点', key: 'location', width: 200 },
  { title: '容量', key: 'capacity', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '停用' })
    }
  },
  { title: '备注', key: 'remark', width: 200 },
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

const data = ref<RoomRecord[]>([])
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

function fetchData() {
  loading.value = true
  // TODO: 调用API获取咨询室列表
  setTimeout(() => {
    data.value = []
    pagination.itemCount = 0
    loading.value = false
  }, 500)
}

function handleAdd() {
  editingRoom.value = null
  Object.assign(roomForm, {
    roomName: '',
    location: '',
    capacity: 1,
    status: 1,
    remark: ''
  })
  showModal.value = true
}

function handleEdit(record: RoomRecord) {
  editingRoom.value = record
  Object.assign(roomForm, {
    roomName: record.roomName,
    location: record.location,
    capacity: record.capacity,
    status: record.status,
    remark: record.remark
  })
  showModal.value = true
}

function handleSubmit() {
  // TODO: 调用API创建/更新咨询室
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
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        remote
        striped
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="editingRoom ? '编辑咨询室' : '新增咨询室'" style="width: 500px">
      <n-form :model="roomForm" label-placement="left" label-width="80">
        <n-form-item label="咨询室名称" required>
          <n-input v-model:value="roomForm.roomName" placeholder="请输入咨询室名称" />
        </n-form-item>
        <n-form-item label="地点">
          <n-input v-model:value="roomForm.location" placeholder="请输入地点" />
        </n-form-item>
        <n-form-item label="容量">
          <n-input-number v-model:value="roomForm.capacity" :min="1" placeholder="请输入容量" />
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
          <n-button type="primary" @click="handleSubmit">确定</n-button>
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