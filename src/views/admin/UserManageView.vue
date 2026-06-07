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
  NPopconfirm,
  NModal,
  NGrid,
  NGi,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface UserRecord {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  roles: string[]
  status: number
  lastLoginTime: string
  createTime: string
}

const message = useMessage()
const loading = ref(false)
const showModal = ref(false)
const editingUser = ref<UserRecord | null>(null)

const searchForm = reactive({
  keyword: '',
  roleCode: '',
  status: null as number | null
})

const userForm = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  roleCodes: [] as string[],
  status: 1
})

const roleOptions = [
  { label: '学生', value: 'STUDENT' },
  { label: '管理员', value: 'ADMIN' },
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '心理助理', value: 'ASSISTANT' },
  { label: '咨询师', value: 'COUNSELOR' }
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const columns: DataTableColumns<UserRecord> = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '姓名', key: 'realName', width: 100 },
  { title: '手机号', key: 'phone', width: 120 },
  {
    title: '角色',
    key: 'roles',
    width: 150,
    render(row) {
      return row.roles.map(role => {
        const roleMap: Record<string, string> = {
          STUDENT: '学生',
          ADMIN: '管理员',
          INTERVIEWER: '初访员',
          ASSISTANT: '心理助理',
          COUNSELOR: '咨询师'
        }
        return h(NTag, { size: 'small', type: 'info' }, { default: () => roleMap[role] || role })
      })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '禁用' })
    }
  },
  { title: '最后登录时间', key: 'lastLoginTime', width: 160 },
  { title: '创建时间', key: 'createTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: row.status === 1 ? 'error' : 'success', onClick: () => handleToggleStatus(row) }, { default: () => row.status === 1 ? '禁用' : '启用' }),
          h(NPopconfirm, { onPositiveClick: () => handleResetPassword(row) }, {
            trigger: () => h(NButton, { size: 'small', type: 'warning' }, { default: () => '重置密码' }),
            default: () => '确定重置密码？'
          })
        ]
      })
    }
  }
]

const data = ref<UserRecord[]>([])
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

function fetchData() {
  loading.value = true
  // TODO: 调用API获取用户列表
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
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    realName: '',
    phone: '',
    email: '',
    password: '',
    roleCodes: [],
    status: 1
  })
  showModal.value = true
}

function handleEdit(record: UserRecord) {
  editingUser.value = record
  Object.assign(userForm, {
    username: record.username,
    realName: record.realName,
    phone: record.phone,
    email: record.email,
    password: '',
    roleCodes: record.roles,
    status: record.status
  })
  showModal.value = true
}

function handleToggleStatus(record: UserRecord) {
  // TODO: 调用API启用/禁用用户
  message.success(record.status === 1 ? '已禁用' : '已启用')
  fetchData()
}

function handleResetPassword(record: UserRecord) {
  // TODO: 调用API重置密码
  message.success('密码已重置')
}

function handleSubmit() {
  // TODO: 调用API创建/更新用户
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
  <div class="user-manage-view">
    <n-card title="用户管理">
      <n-form inline :model="searchForm" @submit.prevent="handleSearch">
        <n-form-item label="关键词">
          <n-input v-model:value="searchForm.keyword" placeholder="用户名/姓名/手机号" clearable />
        </n-form-item>
        <n-form-item label="角色">
          <n-select v-model:value="searchForm.roleCode" :options="roleOptions" placeholder="选择角色" clearable />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="选择状态" clearable />
        </n-form-item>
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">搜索</n-button>
            <n-button @click="handleAdd">新增用户</n-button>
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

    <n-modal v-model:show="showModal" preset="card" :title="editingUser ? '编辑用户' : '新增用户'" style="width: 600px">
      <n-form :model="userForm" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="用户名" required>
              <n-input v-model:value="userForm.username" placeholder="请输入用户名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="姓名" required>
              <n-input v-model:value="userForm.realName" placeholder="请输入姓名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="手机号">
              <n-input v-model:value="userForm.phone" placeholder="请输入手机号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="邮箱">
              <n-input v-model:value="userForm.email" placeholder="请输入邮箱" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="角色" required>
              <n-select v-model:value="userForm.roleCodes" :options="roleOptions" multiple placeholder="选择角色" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="userForm.status" :options="statusOptions" />
            </n-form-item>
          </n-gi>
          <n-gi v-if="!editingUser">
            <n-form-item label="初始密码">
              <n-input v-model:value="userForm.password" type="password" placeholder="留空使用默认密码" />
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
.user-manage-view {
  padding: 16px;
}
</style>