<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
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
import ActionBar from '@/components/ui/ActionBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FileDownloadButton from '@/components/ui/FileDownloadButton.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSection from '@/components/ui/FormSection.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SearchPanel from '@/components/ui/SearchPanel.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import {
  downloadMyCaseReportWord,
  getCaseReport,
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
          h(FileDownloadButton, {
            size: 'small',
            type: 'default',
            text: '下载 Word',
            onDownload: () => handleDownload(row.id),
          }),
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

function validateExistingReportForSubmit(report: CaseReportVO) {
  if (!report.effectSelfRating) {
    message.warning('提交报告前请选择咨询效果自评')
    return false
  }
  if ((report.caseSummary?.trim().length ?? 0) < 20) {
    message.warning('提交报告前个案总结建议不少于 20 字')
    return false
  }
  return true
}

async function persistReport() {
  if (!validateForm(false)) return

  submitting.value = true
  try {
    const payload: CaseReportRequest = {
      ...form,
    }
    if (editingId.value) {
      await updateCaseReport(editingId.value, payload)
    } else {
      const created = await saveCaseReport(payload)
      editingId.value = created.id
    }
    message.success('结案报告草稿已保存')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '保存结案报告失败')
  } finally {
    submitting.value = false
  }
}

async function handleSubmitCurrentForm() {
  if (!validateForm(true)) return

  submitting.value = true
  try {
    const payload: CaseReportRequest = {
      ...form,
    }
    let reportId = editingId.value
    if (reportId) {
      await updateCaseReport(reportId, payload)
    } else {
      const created = await saveCaseReport(payload)
      reportId = created.id
      editingId.value = created.id
    }
    await submitCaseReport(reportId)
    message.success('结案报告已提交')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提交结案报告失败')
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
  })
}

async function handleSubmitReport(id: number) {
  try {
    const report = await getCaseReport(id)
    if (!validateExistingReportForSubmit(report)) {
      return
    }
    await submitCaseReport(id)
    message.success('结案报告已提交')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提交结案报告失败')
  }
}

async function handleDownload(id: number) {
  try {
    await downloadMyCaseReportWord(id)
    message.success('已触发 Word 下载')
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
  <PageContainer class="case-report-edit-view bp-page bp-section-gap">
    <PageHeader
      title="结案报告"
      description="保存结案报告草稿，确认无误后提交，并触发 Word 报告下载。"
    />

    <SectionCard :title="editingId ? '编辑结案报告' : '新增结案报告'">
      <FormSection title="基本信息">
        <div class="bp-form-grid bp-form-grid--responsive">
          <FormField label="学生" required>
            <select v-model.number="form.studentId" class="bp-form-control">
              <option :value="0">请选择学生</option>
              <option v-for="option in studentOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>

          <FormField label="问题类型" required>
            <select v-model.number="form.problemTypeId" class="bp-form-control">
              <option :value="0">请选择问题类型</option>
              <option v-for="option in problemTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>

          <FormField label="咨询总次数" required>
            <n-input-number v-model:value="form.totalSessions" :min="1" :max="99" style="width: 100%" />
          </FormField>

          <FormField label="咨询效果自评" required>
            <select v-model="form.effectSelfRating" class="bp-form-control">
              <option value="">请选择效果自评</option>
              <option v-for="option in effectOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>

          <FormField label="结案类型" required>
            <select v-model="form.closeType" class="bp-form-control">
              <option v-for="option in closeTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="报告内容">
        <FormField label="个案总结" hint="提交报告前建议不少于 20 字">
          <textarea v-model="form.caseSummary" class="bp-form-control" rows="5" placeholder="提交报告前建议不少于 20 字" />
          <div class="bp-char-count">{{ form.caseSummary.length }} 字</div>
        </FormField>

        <FormField label="咨询效果">
          <textarea v-model="form.counselingEffect" class="bp-form-control" rows="4" placeholder="填写咨询过程中的变化和效果" />
        </FormField>

        <FormField label="后续建议">
          <textarea v-model="form.suggestion" class="bp-form-control" rows="4" placeholder="填写后续建议、转介建议或自助练习建议" />
        </FormField>
      </FormSection>

      <ActionBar :sticky="false">
        <n-button @click="resetForm">新建/重置</n-button>
        <n-button :loading="submitting" @click="persistReport">保存草稿</n-button>
        <n-popconfirm @positive-click="handleSubmitCurrentForm">
          <template #trigger>
            <n-button type="primary" :loading="submitting">提交报告</n-button>
          </template>
          提交后管理员可查看和下载，确定提交该结案报告吗？
        </n-popconfirm>
      </ActionBar>
    </SectionCard>

    <SectionCard title="我的结案报告">
      <SearchPanel :loading="loading" @search="handleSearch" @reset="() => { searchForm.studentKeyword = ''; searchForm.status = null; handleSearch() }">
        <div class="bp-form-grid bp-form-grid--responsive">
          <FormField label="学生关键词">
            <input
              v-model="searchForm.studentKeyword"
              class="bp-form-control"
              type="text"
              placeholder="姓名 / 学号 / 问题类型"
              @keyup.enter="handleSearch"
            >
          </FormField>

          <FormField label="报告状态">
            <select
              class="bp-form-control"
              :value="searchForm.status ?? ''"
              @change="handleStatusChange"
            >
              <option value="">全部</option>
              <option v-for="option in reportStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </FormField>
        </div>
      </SearchPanel>

      <EmptyState
        v-if="!loading && data.length === 0"
        title="暂无结案报告"
        description="保存草稿或提交报告后，将在此显示记录"
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
