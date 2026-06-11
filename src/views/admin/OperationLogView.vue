<script setup lang="ts">
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import {
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NSelect,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SearchPanel from '@/components/ui/SearchPanel.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { pageOperationLogs } from '@/api/logs'
import type { OperationLogQuery, OperationLogVO } from '@/api/logs'

const message = useMessage()

const loading = ref(false)
const data = ref<OperationLogVO[]>([])

const searchForm = reactive({
  operatorName: '',
  moduleName: null as string | null,
  operationType: null as string | null,
  resultStatus: null as 'SUCCESS' | 'FAILED' | null,
  dateRange: null as [number, number] | null,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const moduleOptions = [
  { label: '预约审核', value: '预约审核' },
  { label: '咨询安排', value: '咨询安排' },
  { label: '咨询记录', value: '咨询记录' },
  { label: '结案报告', value: '结案报告' },
  { label: '用户管理', value: '用户管理' },
]

const operationTypeOptions = [
  { label: '通过', value: 'APPROVE' },
  { label: '创建', value: 'CREATE' },
  { label: '保存', value: 'SAVE' },
  { label: '提交', value: 'SUBMIT' },
  { label: '禁用', value: 'DISABLE' },
]

const resultStatusOptions = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAILED' },
]

const operationTypeLabelMap: Record<string, string> = {
  APPROVE: '通过',
  CREATE: '创建',
  SAVE: '保存',
  SUBMIT: '提交',
  DISABLE: '禁用',
}

const columns: DataTableColumns<OperationLogVO> = [
  { title: '操作人', key: 'operatorName', width: 110 },
  { title: '角色', key: 'roleCode', width: 100 },
  { title: '模块', key: 'moduleName', width: 110 },
  {
    title: '操作类型',
    key: 'operationType',
    width: 90,
    render(row) {
      return operationTypeLabelMap[row.operationType] ?? row.operationType
    },
  },
  {
    title: '描述',
    key: 'operationDesc',
    minWidth: 260,
    ellipsis: { tooltip: true },
  },
  {
    title: '结果',
    key: 'resultStatus',
    width: 90,
    render(row) {
      return h(
        NTag,
        { type: row.resultStatus === 'SUCCESS' ? 'success' : 'error', round: true },
        { default: () => row.resultStatus === 'SUCCESS' ? '成功' : '失败' },
      )
    },
  },
  {
    title: '耗时',
    key: 'executionTime',
    width: 90,
    render(row) {
      return `${row.executionTime} ms`
    },
  },
  { title: 'IP', key: 'ipAddress', width: 120 },
  { title: '时间', key: 'createTime', width: 160 },
]

function buildQuery(): OperationLogQuery {
  return {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
    keyword: searchForm.operatorName.trim() || undefined,
    moduleName: searchForm.moduleName ?? undefined,
    operationType: searchForm.operationType ?? undefined,
    resultStatus: searchForm.resultStatus ?? undefined,
    startTime: searchForm.dateRange ? dayjs(searchForm.dateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
    endTime: searchForm.dateRange ? dayjs(searchForm.dateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
  }
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageOperationLogs(buildQuery())
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载操作日志失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  void fetchData()
}

function handleReset() {
  searchForm.operatorName = ''
  searchForm.moduleName = null
  searchForm.operationType = null
  searchForm.resultStatus = null
  searchForm.dateRange = null
  handleSearch()
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
  <PageContainer class="operation-log-view bp-page bp-section-gap">
    <PageHeader
      title="操作日志"
      description="追踪管理员、心理助理和咨询师的关键业务操作，支持按模块、操作类型和结果筛选。"
    />

    <SearchPanel :loading="loading" @search="handleSearch" @reset="handleReset">
      <n-form label-placement="top">
        <n-grid :cols="1" :x-gap="16" responsive="screen" item-responsive>
          <n-gi span="1 m:1">
            <n-form-item label="操作人">
              <n-input
                v-model:value="searchForm.operatorName"
                placeholder="姓名关键词"
                clearable
                @keyup.enter="handleSearch"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:1">
            <n-form-item label="模块">
              <n-select
                v-model:value="searchForm.moduleName"
                :options="moduleOptions"
                clearable
                placeholder="全部模块"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:1">
            <n-form-item label="操作类型">
              <n-select
                v-model:value="searchForm.operationType"
                :options="operationTypeOptions"
                clearable
                placeholder="全部类型"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:1">
            <n-form-item label="结果状态">
              <n-select
                v-model:value="searchForm.resultStatus"
                :options="resultStatusOptions"
                clearable
                placeholder="全部状态"
              />
            </n-form-item>
          </n-gi>

          <n-gi span="1 m:2">
            <n-form-item label="时间范围">
              <n-date-picker
                v-model:value="searchForm.dateRange"
                type="daterange"
                clearable
                style="width: 100%"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </SearchPanel>

    <SectionCard title="操作记录">
      <EmptyState
        v-if="!loading && data.length === 0"
        title="暂无操作记录"
        description="调整筛选条件后重试"
      />
      <n-data-table
        v-else
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </SectionCard>
  </PageContainer>
</template>
