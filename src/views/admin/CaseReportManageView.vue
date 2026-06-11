<script setup lang="ts">
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NSelect,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import StatusTag from '@/components/common/StatusTag.vue'
import DataTablePage from '@/components/ui/DataTablePage.vue'
import FileDownloadButton from '@/components/ui/FileDownloadButton.vue'
import { useTablePagination } from '@/composables/useTablePagination'
import {
  downloadCaseReportWord,
  getCaseReportDetail,
  getCounselorStaffOptionsReal,
  getProblemTypeOptionsReal,
  pageCaseReports,
} from '@/api/admin'
import type { AdminCaseReportQuery, AdminCaseReportVO, CloseType, OptionItem } from '@/api/admin'

const message = useMessage()

const loading = ref(false)
const detailLoading = ref(false)
const data = ref<AdminCaseReportVO[]>([])
const detail = ref<AdminCaseReportVO | null>(null)
const showDetail = ref(false)
const counselorOptions = ref<OptionItem[]>([])
const problemTypeOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  studentKeyword: '',
  counselorId: null as number | null,
  problemTypeId: null as number | null,
  closeType: null as CloseType | null,
  dateRange: null as [number, number] | null,
})

const { pagination, setTotal, resetPage, bindRemoteTable } = useTablePagination()

const closeTypeOptions = [
  { label: '正常结案', value: 'NORMAL' },
  { label: '脱落结案', value: 'DROPPED' },
  { label: '转介结案', value: 'TRANSFER' },
]

const columns: DataTableColumns<AdminCaseReportVO> = [
  { title: '报告编号', key: 'reportNo', width: 170 },
  {
    title: '学生',
    key: 'student',
    minWidth: 160,
    render(row) {
      return h('div', { class: 'report-cell' }, [
        h('div', { class: 'report-cell__main' }, row.studentName),
        h('div', { class: 'report-cell__sub' }, row.studentNo),
      ])
    },
  },
  {
    title: '咨询师',
    key: 'counselorName',
    width: 120,
    render(row) {
      return row.counselorName || '-'
    },
  },
  { title: '问题类型', key: 'problemTypeLabel', width: 120 },
  {
    title: '咨询次数',
    key: 'totalSessions',
    width: 90,
    render(row) {
      return `${row.totalSessions} 次`
    },
  },
  {
    title: '结案类型',
    key: 'closeType',
    width: 100,
    render(row) {
      return getCloseTypeLabel(row.closeType)
    },
  },
  {
    title: '状态',
    key: 'reportStatus',
    width: 90,
    render(row) {
      return h(StatusTag, { value: row.reportStatus, type: 'report' })
    },
  },
  {
    title: '提交时间',
    key: 'submitTime',
    width: 170,
    render(row) {
      return row.submitTime || '-'
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => void handleView(row.id) }, { default: () => '查看' }),
          h(FileDownloadButton, { size: 'small', type: 'default', text: '下载 Word', onDownload: () => void handleDownload(row.id) }),
        ],
      })
    },
  },
]

function getCloseTypeLabel(value: CloseType) {
  return closeTypeOptions.find(item => item.value === value)?.label ?? value
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

function buildQuery(): AdminCaseReportQuery {
  return {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
    studentKeyword: searchForm.studentKeyword.trim() || undefined,
    counselorId: searchForm.counselorId,
    problemTypeId: searchForm.problemTypeId,
    closeType: searchForm.closeType,
    startDate: searchForm.dateRange ? dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD') : undefined,
    endDate: searchForm.dateRange ? dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD') : undefined,
  }
}

async function fetchOptions() {
  try {
    const [counselors, problemTypes] = await Promise.all([
      getCounselorStaffOptionsReal(),
      getProblemTypeOptionsReal(),
    ])
    counselorOptions.value = counselors
    problemTypeOptions.value = problemTypes
  } catch (error) {
    message.error(getErrorMessage(error, '加载筛选选项失败'))
  }
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageCaseReports(buildQuery())
    data.value = result.records
    setTotal(result.total)
  } catch (error) {
    message.error(getErrorMessage(error, '加载结案报告失败'))
  } finally {
    loading.value = false
  }
}

async function handleView(id: number) {
  detailLoading.value = true
  showDetail.value = true
  try {
    detail.value = await getCaseReportDetail(id)
  } catch (error) {
    showDetail.value = false
    message.error(getErrorMessage(error, '加载报告详情失败'))
  } finally {
    detailLoading.value = false
  }
}

async function handleDownload(id: number) {
  try {
    await downloadCaseReportWord(id)
    message.success('已触发 Word 下载')
  } catch (error) {
    message.error(getErrorMessage(error, '下载 Word 失败'))
  }
}

const { onUpdatePage, onUpdatePageSize } = bindRemoteTable(fetchData)

function handleSearch() {
  resetPage()
  void fetchData()
}

function handleReset() {
  searchForm.studentKeyword = ''
  searchForm.counselorId = null
  searchForm.problemTypeId = null
  searchForm.closeType = null
  searchForm.dateRange = null
  handleSearch()
}

onMounted(() => {
  void fetchOptions()
  void fetchData()
})
</script>

<template>
  <div>
    <DataTablePage
      title="结案报告管理"
      description="查看咨询师已提交的结案报告，支持按学生、咨询师、问题类型、结案类型和日期筛选，并下载 Word。"
      table-title="结案报告列表"
      :loading="loading"
      :columns="columns"
      :data="data"
      :pagination="pagination"
      :row-key="(row: AdminCaseReportVO) => row.id"
      :scroll-x="1100"
      @search="handleSearch"
      @reset="handleReset"
      @update:page="onUpdatePage"
      @update:page-size="onUpdatePageSize"
    >
      <template #search>
        <n-form label-placement="top">
          <n-grid :cols="1" :x-gap="16" responsive="screen" item-responsive>
            <n-gi span="1 m:1">
              <n-form-item label="学生关键词">
                <n-input
                  v-model:value="searchForm.studentKeyword"
                  placeholder="姓名 / 学号"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:1">
              <n-form-item label="咨询师">
                <n-select v-model:value="searchForm.counselorId" :options="counselorOptions" clearable placeholder="全部咨询师" />
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:1">
              <n-form-item label="问题类型">
                <n-select v-model:value="searchForm.problemTypeId" :options="problemTypeOptions" clearable placeholder="全部问题类型" />
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:1">
              <n-form-item label="结案类型">
                <n-select v-model:value="searchForm.closeType" :options="closeTypeOptions" clearable placeholder="全部结案类型" />
              </n-form-item>
            </n-gi>
            <n-gi span="1 m:2">
              <n-form-item label="提交日期范围">
                <n-date-picker v-model:value="searchForm.dateRange" type="daterange" clearable style="width: 100%" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>
      </template>
    </DataTablePage>

    <n-drawer v-model:show="showDetail" :width="720">
      <n-drawer-content title="结案报告详情" closable>
        <div v-if="detailLoading" class="detail-loading">正在加载详情...</div>
        <template v-else-if="detail">
          <n-descriptions bordered label-placement="left" :column="2" size="small">
            <n-descriptions-item label="报告编号">{{ detail.reportNo }}</n-descriptions-item>
            <n-descriptions-item label="提交状态">
              <StatusTag :value="detail.reportStatus" type="report" />
            </n-descriptions-item>
            <n-descriptions-item label="学生姓名">{{ detail.studentName }}</n-descriptions-item>
            <n-descriptions-item label="学号">{{ detail.studentNo }}</n-descriptions-item>
            <n-descriptions-item label="院系">{{ detail.college || '-' }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ detail.phone || '-' }}</n-descriptions-item>
            <n-descriptions-item label="咨询师">{{ detail.counselorName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="问题类型">{{ detail.problemTypeLabel }}</n-descriptions-item>
            <n-descriptions-item label="咨询总次数">{{ detail.totalSessions }} 次</n-descriptions-item>
            <n-descriptions-item label="结案类型">{{ getCloseTypeLabel(detail.closeType) }}</n-descriptions-item>
            <n-descriptions-item label="效果自评">{{ detail.effectSelfRating || '-' }}</n-descriptions-item>
            <n-descriptions-item label="提交时间">{{ detail.submitTime || '-' }}</n-descriptions-item>
          </n-descriptions>

          <n-card title="个案总结" size="small" style="margin-top: 16px">
            <div class="report-text">{{ detail.caseSummary || '暂无内容' }}</div>
          </n-card>

          <n-card title="咨询效果" size="small" style="margin-top: 16px">
            <div class="report-text">{{ detail.counselingEffect || '暂无内容' }}</div>
          </n-card>

          <n-card title="后续建议" size="small" style="margin-top: 16px">
            <div class="report-text">{{ detail.suggestion || '暂无内容' }}</div>
          </n-card>

          <div class="detail-actions">
            <n-button type="primary" @click="detail && handleDownload(detail.id)">下载 Word</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
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

.detail-loading {
  padding: 16px 0;
  color: #6b7280;
}

.report-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #374151;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
