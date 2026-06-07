<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NInputNumber,
  NPopconfirm,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  downloadMyCaseReportWord,
  getCounselorProblemTypeOptions,
  getCounselorStudentOptions,
  pageMyCaseReports,
  saveCaseReport,
  submitCaseReport,
  updateCaseReport,
} from '@/api/counselor'
import type { CaseReportRequest, CaseReportVO, CloseType, ReportStatus } from '@/api/counselor'
import type { OptionItem } from '@/api/admin'

const route = useRoute()
const message = useMessage()

const loading = ref(false)
const submitting = ref(false)
const data = ref<CaseReportVO[]>([])
const editingId = ref<number | null>(null)
const studentOptions = ref<OptionItem[]>([])
const problemTypeOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  studentKeyword: '',
  status: null as ReportStatus | null,
})

const form = reactive<CaseReportRequest>({
  studentId: 0,
  problemTypeId: 0,
  totalSessions: 1,
  effectSelfRating: '',
  caseSummary: '',
  counselingEffect: '',
  suggestion: '',
  closeType: 'NORMAL',
  reportStatus: 'DRAFT',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const reportStatusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
]

const closeTypeOptions = [
  { label: '正常结案', value: 'NORMAL' },
  { label: '脱落结案', value: 'DROPPED' },
  { label: '转介结案', value: 'TRANSFER' },
]

const effectOptions = [
  { label: '明显改善', value: '明显改善' },
  { label: '较好', value: '较好' },
  { label: '一般', value: '一般' },
  { label: '仍需跟进', value: '仍需跟进' },
]

const columns: DataTableColumns<CaseReportVO> = [
  {
    title: '学生',
    key: 'student',
    width: 140,
    render(row) {
      return h('div', { class: 'report-cell' }, [
        h('div', { class: 'report-cell__main' }, row.studentName),
        h('div', { class: 'report-cell__sub' }, row.studentNo),
      ])
    },
  },
  { title: '问题类型', key: 'problemTypeLabel', width: 110 },
  { title: '咨询次数', key: 'totalSessions', width: 90, render: row => `${row.totalSessions} 次` },
  { title: '结案类型', key: 'closeType', width: 100, render: row => getCloseTypeLabel(row.closeType) },
  {
    title: '状态',
    key: 'reportStatus',
    width: 100,
    render(row) {
      return h(StatusTag, { value: row.reportStatus, type: 'report' })
    },
  },
  { title: '更新时间', key: 'updateTime', width: 150 },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
          row.reportStatus === 'DRAFT'
            ? h(
              NPopconfirm,
              { onPositiveClick: () => handleSubmitReport(row.id) },
              {
                trigger: () => h(NButton, { size: 'small', type: 'primary' }, { default: () => '提交' }),
                default: () => '提交后管理员可查看和下载，确定提交该结案报告吗？',
              },
            )
            : null,
          h(NButton, { size: 'small', onClick: () => handleDownload(row.id) }, { default: () => '下载 Word' }),
        ].filter(Boolean),
      })
    },
  },
]

function getCloseTypeLabel(value: CloseType) {
  return closeTypeOptions.find(item => item.value === value)?.label ?? value
}

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    studentId: Number(route.query.studentId || 0),
    problemTypeId: 0,
    totalSessions: 1,
    effectSelfRating: '',
    caseSummary: '',
    counselingEffect: '',
    suggestion: '',
    closeType: 'NORMAL' as CloseType,
    reportStatus: 'DRAFT' as ReportStatus,
  })
}

async function fetchOptions() {
  try {
    const [students, problemTypes] = await Promise.all([
      getCounselorStudentOptions(),
      getCounselorProblemTypeOptions(),
    ])
    studentOptions.value = students
    problemTypeOptions.value = problemTypes
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载报告选项失败')
  }
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageMyCaseReports({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      studentKeyword: searchForm.studentKeyword,
      status: searchForm.status,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载结案报告失败')
  } finally {
    loading.value = false
  }
}

function validateForm(isSubmit: boolean) {
  if (!form.studentId) {
    message.warning('请选择学生')
    return false
  }
  if (!form.problemTypeId) {
    message.warning('请选择问题类型')
    return false
  }
  if (form.totalSessions <= 0) {
    message.warning('咨询总次数必须大于 0')
    return false
  }
  if (!form.closeType) {
    message.warning('请选择结案类型')
    return false
  }
  if (isSubmit && !form.effectSelfRating) {
    message.warning('提交报告前请选择咨询效果自评')
    return false
  }
  if (isSubmit && (form.caseSummary?.trim().length ?? 0) < 20) {
    message.warning('提交报告前个案总结建议不少于 20 字')
    return false
  }
  return true
}

async function persistReport(nextStatus: ReportStatus) {
  const isSubmit = nextStatus === 'SUBMITTED'
  if (!validateForm(isSubmit)) return

  submitting.value = true
  try {
    const payload: CaseReportRequest = {
      ...form,
      reportStatus: nextStatus,
    }
    if (editingId.value) {
      await updateCaseReport(editingId.value, payload)
    } else {
      const created = await saveCaseReport(payload)
      editingId.value = created.id
    }
    message.success(isSubmit ? '结案报告已提交' : '结案报告草稿已保存')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存结案报告失败')
  } finally {
    submitting.value = false
  }
}

function handleEdit(row: CaseReportVO) {
  editingId.value = row.id
  Object.assign(form, {
    studentId: row.studentId,
    problemTypeId: row.problemTypeId,
    totalSessions: row.totalSessions,
    effectSelfRating: row.effectSelfRating,
    caseSummary: row.caseSummary || '',
    counselingEffect: row.counselingEffect || '',
    suggestion: row.suggestion || '',
    closeType: row.closeType,
    reportStatus: row.reportStatus,
  })
}

async function handleSubmitReport(id: number) {
  try {
    await submitCaseReport(id)
    message.success('结案报告已提交')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提交结案报告失败')
  }
}

async function handleDownload(id: number) {
  try {
    const result = await downloadMyCaseReportWord(id)
    message.success(`已触发 Word 下载：${result.fileName}`)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '下载 Word 失败')
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchData()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.status = value ? value as ReportStatus : null
  handleSearch()
}

onMounted(() => {
  resetForm()
  void fetchOptions()
  void fetchData()
})
</script>

<template>
  <div class="case-report-edit-view">
    <PageHeader
      title="结案报告"
      description="保存结案报告草稿，确认无误后提交，并触发 Word 报告下载。"
    />

    <n-card :title="editingId ? '编辑结案报告' : '新增结案报告'">
      <div class="form-grid">
        <label class="form-field">
          <span>学生 <em>*</em></span>
          <select v-model.number="form.studentId">
            <option :value="0">请选择学生</option>
            <option v-for="option in studentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>问题类型 <em>*</em></span>
          <select v-model.number="form.problemTypeId">
            <option :value="0">请选择问题类型</option>
            <option v-for="option in problemTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>咨询总次数 <em>*</em></span>
          <n-input-number v-model:value="form.totalSessions" :min="1" :max="99" style="width: 100%" />
        </label>

        <label class="form-field">
          <span>咨询效果自评 <em>*</em></span>
          <select v-model="form.effectSelfRating">
            <option value="">请选择效果自评</option>
            <option v-for="option in effectOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>结案类型 <em>*</em></span>
          <select v-model="form.closeType">
            <option v-for="option in closeTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <label class="form-field">
        <span>个案总结</span>
        <textarea v-model="form.caseSummary" rows="5" placeholder="提交报告前建议不少于 20 字" />
      </label>

      <label class="form-field">
        <span>咨询效果</span>
        <textarea v-model="form.counselingEffect" rows="4" placeholder="填写咨询过程中的变化和效果" />
      </label>

      <label class="form-field">
        <span>后续建议</span>
        <textarea v-model="form.suggestion" rows="4" placeholder="填写后续建议、转介建议或自助练习建议" />
      </label>

      <div class="form-actions">
        <n-button @click="resetForm">新建/重置</n-button>
        <n-button :loading="submitting" @click="persistReport('DRAFT')">保存草稿</n-button>
        <n-popconfirm @positive-click="persistReport('SUBMITTED')">
          <template #trigger>
            <n-button type="primary" :loading="submitting">提交报告</n-button>
          </template>
          提交后管理员可查看和下载，确定提交该结案报告吗？
        </n-popconfirm>
      </div>
    </n-card>

    <n-card title="我的结案报告" style="margin-top: 16px">
      <div class="search-panel">
        <label class="form-field">
          <span>学生关键词</span>
          <input v-model="searchForm.studentKeyword" type="text" placeholder="姓名 / 学号 / 问题类型" @keyup.enter="handleSearch">
        </label>

        <label class="form-field">
          <span>报告状态</span>
          <select :value="searchForm.status ?? ''" @change="handleStatusChange">
            <option value="">全部</option>
            <option v-for="option in reportStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <div class="search-actions">
        <n-button @click="() => { searchForm.studentKeyword = ''; searchForm.status = null; handleSearch() }">重置</n-button>
        <n-button type="primary" @click="handleSearch">搜索</n-button>
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
.case-report-edit-view {
  padding: 16px;
}

.form-grid,
.search-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.form-field input,
.form-field select,
.form-field textarea {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font: inherit;
}

.form-actions,
.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}

.search-actions {
  margin-bottom: 16px;
}

.report-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-cell__main {
  color: #111827;
  font-weight: 600;
}

.report-cell__sub {
  color: #6b7280;
  font-size: 12px;
}
</style>
