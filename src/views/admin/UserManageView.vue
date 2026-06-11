<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import DataTablePage from '@/components/ui/DataTablePage.vue'
import { useTablePagination } from '@/composables/useTablePagination'
import {
  createUser,
  disableUser,
  enableUser,
  getRoleLabel,
  pageUsers,
  resetPassword,
  updateUser,
} from '@/api/admin'
import type { UserSaveRequest, UserVO } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const editingUser = ref<UserVO | null>(null)

const searchForm = reactive({
  keyword: '',
  roleCode: null as string | null,
  status: null as number | null,
})

const userForm = reactive<UserSaveRequest>({
  username: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  roleCodes: [],
  status: 1,
})

const roleOptions = [
  { label: '学生', value: 'STUDENT' },
  { label: '管理员', value: 'ADMIN' },
  { label: '初访员', value: 'INTERVIEWER' },
  { label: '心理助理', value: 'ASSISTANT' },
  { label: '咨询师', value: 'COUNSELOR' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

const columns: DataTableColumns<UserVO> = [
  { title: '用户名', key: 'username', width: 140 },
  { title: '姓名', key: 'realName', width: 110 },
  { title: '手机号', key: 'phone', width: 130 },
  { title: '邮箱', key: 'email', width: 200 },
  {
    title: '角色',
    key: 'roles',
    width: 220,
    render(row) {
      return h(NSpace, { size: 6, wrapItem: true }, {
        default: () => row.roles.map(role => h(NTag, { size: 'small', type: 'info' }, { default: () => getRoleLabel(role) })),
      })
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row) {
      return h(NTag, { type: row.status === 1 ? 'success' : 'error' }, { default: () => row.status === 1 ? '启用' : '禁用' })
    },
  },
  { title: '最后登录时间', key: 'lastLoginTime', width: 160 },
  { title: '创建时间', key: 'createTime', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 240,
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
                { default: () => row.status === 1 ? '禁用' : '启用' },
              ),
              default: () => `确定${row.status === 1 ? '禁用' : '启用'}该用户吗？`,
            },
          ),
          h(
            NPopconfirm,
            { onPositiveClick: () => handleResetPassword(row) },
            {
              trigger: () => h(NButton, { size: 'small', type: 'warning' }, { default: () => '重置密码' }),
              default: () => '确定将密码重置为默认值 123456 吗？',
            },
          ),
        ],
      })
    },
  },
]

const data = ref<UserVO[]>([])
const { pagination, setTotal, resetPage, bindRemoteTable } = useTablePagination()

function resetUserForm() {
  Object.assign(userForm, {
    username: '',
    realName: '',
    phone: '',
    email: '',
    password: '',
    roleCodes: [],
    status: 1,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageUsers({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      roleCode: searchForm.roleCode ?? undefined,
      status: searchForm.status,
    })
    data.value = result.records
    setTotal(result.total)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载用户列表失败')
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
  searchForm.roleCode = null
  searchForm.status = null
  handleSearch()
}

function handleAdd() {
  editingUser.value = null
  resetUserForm()
  showModal.value = true
}

function handleEdit(record: UserVO) {
  editingUser.value = record
  Object.assign(userForm, {
    username: record.username,
    realName: record.realName,
    phone: record.phone,
    email: record.email,
    password: '',
    roleCodes: [...record.roles],
    status: record.status,
  })
  showModal.value = true
}

async function handleToggleStatus(record: UserVO) {
  try {
    if (record.status === 1) {
      await disableUser(record.id)
      message.success('用户已禁用')
    } else {
      await enableUser(record.id)
      message.success('用户已启用')
    }
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '更新用户状态失败')
  }
}

async function handleResetPassword(record: UserVO) {
  try {
    await resetPassword(record.id)
    message.success(`已将 ${record.realName} 的密码重置为默认值 123456`)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '重置密码失败')
  }
}

async function handleSubmit() {
  if (!userForm.username.trim()) {
    message.warning('请输入用户名')
    return
  }
  if (!userForm.realName.trim()) {
    message.warning('请输入姓名')
    return
  }
  if (userForm.roleCodes.length === 0) {
    message.warning('请至少选择一个角色')
    return
  }

  submitting.value = true
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, userForm)
      message.success('用户信息已更新')
    } else {
      await createUser(userForm)
      message.success('用户已创建')
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存用户失败')
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
      title="用户管理"
      description="维护系统登录账号、角色分配与启用状态，支持重置默认密码。"
      table-title="用户列表"
      :loading="loading"
      :columns="columns"
      :data="data"
      :pagination="pagination"
      :scroll-x="1450"
      :row-key="(row: UserVO) => row.id"
      @search="handleSearch"
      @reset="handleReset"
      @update:page="onUpdatePage"
      @update:page-size="onUpdatePageSize"
    >
      <template #header-actions>
        <n-button type="primary" @click="handleAdd">新增用户</n-button>
      </template>
      <template #search>
        <n-form class="admin-search-grid" label-placement="top" :model="searchForm">
          <n-form-item label="关键词">
            <n-input v-model:value="searchForm.keyword" placeholder="用户名/姓名/手机号/邮箱" clearable @keyup.enter="handleSearch" />
          </n-form-item>
          <n-form-item label="角色">
            <n-select v-model:value="searchForm.roleCode" :options="roleOptions" placeholder="选择角色" clearable />
          </n-form-item>
          <n-form-item label="状态">
            <n-select v-model:value="searchForm.status" :options="statusOptions" placeholder="选择状态" clearable />
          </n-form-item>
        </n-form>
      </template>
    </DataTablePage>

    <n-modal v-model:show="showModal" preset="card" :title="editingUser ? '编辑用户' : '新增用户'" style="width: 640px">
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
              <n-select v-model:value="userForm.roleCodes" :options="roleOptions" multiple placeholder="请选择角色" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态">
              <n-select v-model:value="userForm.status" :options="statusOptions" />
            </n-form-item>
          </n-gi>
          <n-gi v-if="!editingUser" :span="2">
            <n-form-item label="初始密码">
              <n-input v-model:value="userForm.password" type="password" show-password-on="click" placeholder="留空则使用默认密码 123456" />
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
