<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NInputNumber,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ActionBar from '@/components/ui/ActionBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSection from '@/components/ui/FormSection.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SearchPanel from '@/components/ui/SearchPanel.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
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
  <PageContainer class="extension-request-view bp-page bp-section-gap">
    <PageHeader
      title="追加咨询申请"
      description="为仍需继续支持的学生提交追加咨询次数申请，并查看审核状态。"
    />

    <SectionCard title="新增申请">
      <FormSection title="申请信息">
        <div class="bp-form-grid bp-form-grid--responsive">
          <FormField label="学生" required>
            <select v-model.number="form.studentId" class="bp-form-control">
              <option :value="null">请选择学生</option>
              <option v-for="option in studentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>

          <FormField label="追加次数" required>
            <n-input-number v-model:value="form.requestSessions" :min="1" :max="12" style="width: 100%" />
          </FormField>
        </div>
      </FormSection>

      <FormField label="申请原因" required hint="不少于 10 个字">
        <textarea
          v-model="form.reason"
          class="bp-form-control"
          rows="4"
          placeholder="请说明为什么需要追加咨询，至少 10 个字"
        />
        <div class="bp-char-count">{{ form.reason.trim().length }} / 10 字起</div>
      </FormField>

      <ActionBar :sticky="false">
        <n-button @click="resetForm">重置</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</n-button>
      </ActionBar>
    </SectionCard>

    <SectionCard title="申请记录">
      <SearchPanel
        title="筛选"
        :show-search="false"
        @reset="() => { searchForm.status = null; fetchData() }"
      >
        <FormField label="审核状态">
          <select
            class="bp-form-control"
            :value="searchForm.status ?? ''"
            @change="handleStatusChange"
          >
            <option value="">全部</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </FormField>
      </SearchPanel>

      <EmptyState
        v-if="!loading && data.length === 0"
        title="暂无申请记录"
        description="提交追加咨询申请后，可在此查看审核进度"
      />
      <n-data-table
        v-else
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="page => { pagination.page = page; fetchData() }"
        @update:page-size="pageSize => { pagination.pageSize = pageSize; pagination.page = 1; fetchData() }"
      />
    </SectionCard>
  </PageContainer>
</template>

<style scoped>
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
