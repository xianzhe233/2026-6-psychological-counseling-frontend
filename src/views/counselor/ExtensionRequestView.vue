<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NInputNumber,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  createExtensionRequest,
  getCounselorStudentOptions,
  pageMyExtensionRequests,
} from '@/api/counselor'
import type { ExtensionRequestStatus, ExtensionRequestVO } from '@/api/counselor'
import type { OptionItem } from '@/api/admin'

const message = useMessage()

const loading = ref(false)
const submitting = ref(false)
const data = ref<ExtensionRequestVO[]>([])
const studentOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  status: null as ExtensionRequestStatus | null,
})

const form = reactive({
  studentId: null as number | null,
  requestSessions: 1,
  reason: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const statusOptions = [
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
]

const columns: DataTableColumns<ExtensionRequestVO> = [
  {
    title: '学生',
    key: 'student',
    width: 140,
    render(row) {
      return h('div', { class: 'request-cell' }, [
        h('div', { class: 'request-cell__main' }, row.studentName),
        h('div', { class: 'request-cell__sub' }, row.studentNo),
      ])
    },
  },
  { title: '申请次数', key: 'requestSessions', width: 100, render: row => `${row.requestSessions} 次` },
  { title: '申请原因', key: 'reason', minWidth: 220 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.status })
    },
  },
  { title: '审核备注', key: 'auditRemark', minWidth: 140, render: row => row.auditRemark || '-' },
  { title: '提交时间', key: 'createTime', width: 150 },
]

async function fetchData() {
  loading.value = true
  try {
    const result = await pageMyExtensionRequests({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载追加申请失败')
  } finally {
    loading.value = false
  }
}

async function fetchStudentOptions() {
  try {
    studentOptions.value = await getCounselorStudentOptions()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载学生选项失败')
  }
}

function resetForm() {
  form.studentId = null
  form.requestSessions = 1
  form.reason = ''
}

function validateForm() {
  if (!form.studentId) {
    message.warning('请选择学生')
    return false
  }
  if (form.requestSessions <= 0) {
    message.warning('追加次数必须大于 0')
    return false
  }
  if (!form.reason.trim()) {
    message.warning('追加申请原因必填')
    return false
  }
  if (form.reason.trim().length < 10) {
    message.warning('追加申请原因不少于 10 字')
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm() || !form.studentId) return

  submitting.value = true
  try {
    await createExtensionRequest({
      studentId: form.studentId,
      requestSessions: form.requestSessions,
      reason: form.reason,
    })
    message.success('追加咨询申请已提交')
    resetForm()
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提交追加申请失败')
  } finally {
    submitting.value = false
  }
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.status = value ? value as ExtensionRequestStatus : null
  pagination.page = 1
  void fetchData()
}

onMounted(() => {
  void fetchStudentOptions()
  void fetchData()
})
</script>

<template>
  <div class="extension-request-view">
    <PageHeader
      title="追加咨询申请"
      description="为仍需继续支持的学生提交追加咨询次数申请，并查看审核状态。"
    />

    <n-card title="新增申请">
      <div class="form-grid">
        <label class="form-field">
          <span>学生 <em>*</em></span>
          <select v-model.number="form.studentId">
            <option :value="null">请选择学生</option>
            <option v-for="option in studentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>追加次数 <em>*</em></span>
          <n-input-number v-model:value="form.requestSessions" :min="1" :max="12" style="width: 100%" />
        </label>
      </div>

      <label class="form-field">
        <span>申请原因 <em>*</em></span>
        <textarea v-model="form.reason" rows="4" placeholder="请说明为什么需要追加咨询，至少 10 个字" />
      </label>

      <div class="form-actions">
        <n-button @click="resetForm">重置</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</n-button>
      </div>
    </n-card>

    <n-card title="申请记录" style="margin-top: 16px">
      <div class="filter-row">
        <label class="form-field form-field--inline">
          <span>审核状态</span>
          <select :value="searchForm.status ?? ''" @change="handleStatusChange">
            <option value="">全部</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <n-space>
          <n-button @click="() => { searchForm.status = null; fetchData() }">重置</n-button>
        </n-space>
      </div>

      <n-data-table
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="page => { pagination.page = page; fetchData() }"
        @update:page-size="pageSize => { pagination.pageSize = pageSize; pagination.page = 1; fetchData() }"
      />
    </n-card>
  </div>
</template>

<style scoped>
.extension-request-view {
  padding: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: #4b5563;
  font-size: 14px;
}

.form-field em {
  color: #ef4444;
  font-style: normal;
}

.form-field select,
.form-field textarea {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font: inherit;
}

.form-field--inline {
  width: 220px;
  margin-bottom: 0;
}

.form-actions,
.filter-row {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
}

.filter-row {
  justify-content: space-between;
  margin-bottom: 16px;
}

.request-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.request-cell__main {
  color: #111827;
  font-weight: 600;
}

.request-cell__sub {
  color: #6b7280;
  font-size: 12px;
}
</style>
