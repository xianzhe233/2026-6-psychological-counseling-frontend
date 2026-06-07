<script setup lang="ts">
import { h, ref, reactive, onMounted } from 'vue'
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
  NGrid,
  NGi,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface StaffRecord {
  id: number
  userId: number
  staffNo: string
  realName: string
  phone: string
  staffType: string
  title: string
  specialty: string
  maxDailyAppointments: number
  status: number
}

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const editingStaff = ref<StaffRecord | null>(null)

const searchForm = reactive({
  keyword: '',
  staffType: '',
  status: null as number | null
})

const staffForm = reactive({
  userId: null as number | null,
  username: '',
  realName: '',
  phone: '',
  staffNo: '',
  staffType: '',
  title: '',
  specialty: '',
  introduction: '',
  maxDailyAppointments: 6,
  status: 1
})

const staffTypeOptions = [
  { label: '管理员', value: 'ADMIN' },
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '心理助理', value: 'ASSISTANT' },
  { label: '咨询师', value: 'COUNSELOR' }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const columns: DataTableColumns<StaffRecord> = [
  { title: '工号', key: 'staffNo', width: 100 },
  { title: '姓名', key: 'realName', width: 100 },
  { title: '手机号', key: 'phone', width: 120 },
  {
    title: '类型',
    key: 'staffType',
    width: 100,
    render(row) {
      const typeMap: Record<string, string> = {
        ADMIN: '管理员',
        INTERVIEWER: '初访员',
        ASSISTANT: '心理助理',
        COUNSELOR: '咨询师'
      }
      return h(NTag, { type: 'info' }, { default: () => typeMap[row.staffType] || row.staffType })
    }
  },
  { title: '职称', key: 'title', width: 100 },
  { title: '擅长方向', key: 'specialty', width: 150 },
  { title: '每日容量', key: 'maxDailyAppointments', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '禁用' })
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

const data = ref<StaffRecord[]>([])
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

function fetchData() {
  loading.value = true
  // TODO: 调用API获取工作人员列表
  setTimeout(() => {
    data.value = []
    pagination.itemCount = 0
    loading.value = false
  }, 500)
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleAdd() {
  editingStaff.value = null
  Object.assign(staffForm, {
    userId: null,
    username: '',
    realName: '',
    phone: '',
    staffNo: '',
    staffType: '',
    title: '',
    specialty: '',
    introduction: '',
    maxDailyAppointments: 6,
    status: 1
  })
  showModal.value = true
}

function handleEdit(record: StaffRecord) {
  editingStaff.value = record
  Object.assign(staffForm, {
    userId: record.userId,
    username: '',
    realName: record.realName,
    phone: record.phone,
    staffNo: record.staffNo,
    staffType: record.staffType,
    title: record.title,
    specialty: record.specialty,
    introduction: '',
    maxDailyAppointments: record.maxDailyAppointments,
    status: record.status
  })
  showModal.value = true
}

function handleSubmit() {
  // TODO: 调用API创建/更新工作人员
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
  <div class="staff-manage-view">
    <n-card title="工作人员管理">
      <n-form inline :model="searchForm" @submit.prevent="handleSearch">
        <n-form-item label="关键词">
          <n-input v-model:value="searchForm.keyword" placeholder="工号/姓名/手机号" clearable />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="searchForm.staffType" :options="staffTypeOptions" placeholder="选择类型" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="选择状态" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">搜索</n-button>
            <n-button @click="handleAdd">新增工作人员</n-button>
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

    <n-modal v-model:show="showModal" preset="card" :title="editingStaff ? '编辑工作人员' : '新增工作人员'" style="width: 700px">
      <n-form :model="staffForm" label-placement="left" label-width="100">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="姓名" required>
              <n-input v-model:value="staffForm.realName" placeholder="请输入姓名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="手机号">
              <n-input v-model:value="staffForm.phone" placeholder="请输入手机号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工号">
              <n-input v-model:value="staffForm.staffNo" placeholder="请输入工号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="类型" required>
              <n-select v-model:value="staffForm.staffType" :options="staffTypeOptions" placeholder="选择类型" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="职称">
              <n-input v-model:value="staffForm.title" placeholder="请输入职称" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="擅长方向">
              <n-input v-model:value="staffForm.specialty" placeholder="请输入擅长方向" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="每日容量">
              <n-input-number v-model:value="staffForm.maxDailyAppointments" :min="1" placeholder="每日最大预约量" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="staffForm.status" :options="statusOptions" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="简介">
              <n-input v-model:value="staffForm.introduction" type="textarea" placeholder="请输入简介" />
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
  </div>
</template>

<style scoped>
.staff-manage-view {
  padding: 16px;
}
</style>