<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import {
  createStaff,
  getStaffTypeLabel,
  pageStaff,
  updateStaff,
} from '@/api/admin'
import type { StaffSaveRequest, StaffVO } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const editingStaff = ref<StaffVO | null>(null)

const searchForm = reactive({
  keyword: '',
  staffType: null as string | null,
  status: null as number | null,
})

const staffForm = reactive<StaffSaveRequest>({
  userId: undefined,
  username: '',
  realName: '',
  phone: '',
  staffNo: '',
  staffType: '',
  title: '',
  specialty: '',
  introduction: '',
  maxDailyAppointments: 6,
  status: 1,
})

const staffTypeOptions = [
  { label: '管理员', value: 'ADMIN' },
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '心理助理', value: 'ASSISTANT' },
  { label: '咨询师', value: 'COUNSELOR' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

const columns: DataTableColumns<StaffVO> = [
  { title: '工号', key: 'staffNo', width: 110 },
  {
    title: '登录账号',
    key: 'username',
    width: 140,
    render(row) {
      return row.username || '-'
    },
  },
  { title: '姓名', key: 'realName', width: 110 },
  { title: '手机号', key: 'phone', width: 130 },
  {
    title: '类型',
    key: 'staffType',
    width: 110,
    render(row) {
      return h(NTag, { type: 'info' }, { default: () => getStaffTypeLabel(row.staffType) })
    },
  },
  { title: '职称', key: 'title', width: 120 },
  { title: '擅长方向', key: 'specialty', width: 180 },
  { title: '每日容量', key: 'maxDailyAppointments', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '禁用' })
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

const data = ref<StaffVO[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

function resetStaffForm() {
  Object.assign(staffForm, {
    userId: undefined,
    username: '',
    realName: '',
    phone: '',
    staffNo: '',
    staffType: '',
    title: '',
    specialty: '',
    introduction: '',
    maxDailyAppointments: 6,
    status: 1,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageStaff({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      staffType: searchForm.staffType ?? undefined,
      status: searchForm.status,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载工作人员失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.staffType = null
  searchForm.status = null
  handleSearch()
}

function handleAdd() {
  editingStaff.value = null
  resetStaffForm()
  showModal.value = true
}

function handleEdit(record: StaffVO) {
  editingStaff.value = record
  Object.assign(staffForm, {
    userId: record.userId,
    username: record.username ?? '',
    realName: record.realName,
    phone: record.phone,
    staffNo: record.staffNo,
    staffType: record.staffType,
    title: record.title,
    specialty: record.specialty,
    introduction: record.introduction,
    maxDailyAppointments: record.maxDailyAppointments,
    status: record.status,
  })
  showModal.value = true
}

async function handleSubmit() {
  if (!editingStaff.value && !staffForm.username?.trim()) {
    message.warning('请输入登录账号')
    return
  }
  if (!staffForm.realName.trim()) {
    message.warning('请输入姓名')
    return
  }
  if (!staffForm.staffType) {
    message.warning('请选择工作人员类型')
    return
  }
  if (!staffForm.maxDailyAppointments || staffForm.maxDailyAppointments < 1) {
    message.warning('每日容量必须大于 0')
    return
  }

  submitting.value = true
  try {
    if (editingStaff.value) {
      await updateStaff(editingStaff.value.id, staffForm)
      message.success('工作人员信息已更新')
    } else {
      await createStaff(staffForm)
      message.success('工作人员已创建')
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存工作人员失败')
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
            <n-button @click="handleReset">重置</n-button>
            <n-button tertiary type="primary" @click="handleAdd">新增工作人员</n-button>
          </n-space>
        </n-form-item>
      </n-form>

      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1240"
        remote
        striped
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="editingStaff ? '编辑工作人员' : '新增工作人员'" style="width: 720px">
      <n-form :model="staffForm" label-placement="left" label-width="100">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="登录账号" :required="!editingStaff">
              <n-input
                v-model:value="staffForm.username"
                :disabled="Boolean(editingStaff)"
                :placeholder="editingStaff ? '登录账号请到用户管理页修改' : '请输入登录账号（初始密码默认为 123456）'"
              />
            </n-form-item>
          </n-gi>
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
              <n-input v-model:value="staffForm.staffNo" placeholder="不填则自动生成" />
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
              <n-input-number v-model:value="staffForm.maxDailyAppointments" :min="1" placeholder="每日最大预约量" style="width: 100%" />
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
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
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
