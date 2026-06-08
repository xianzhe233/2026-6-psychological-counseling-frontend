<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NTag,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import { pageOperationLogs } from '@/api/logs'
import type { OperationLogVO } from '@/api/logs'

const message = useMessage()

const loading = ref(false)
const data = ref<OperationLogVO[]>([])

const searchForm = reactive({
  operatorName: '',
  moduleName: null as string | null,
  operationType: null as string | null,
  resultStatus: null as 'SUCCESS' | 'FAILED' | null,
  startTime: '',
  endTime: '',
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
  { title: '角色', key: 'roleName', width: 100 },
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
    key: 'description',
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
    key: 'durationMs',
    width: 90,
    render(row) {
      return `${row.durationMs} ms`
    },
  },
  { title: 'IP', key: 'ipAddress', width: 120 },
  { title: '时间', key: 'operateTime', width: 160 },
]

async function fetchData() {
  loading.value = true
  try {
    const result = await pageOperationLogs({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      operatorName: searchForm.operatorName || undefined,
      moduleName: searchForm.moduleName ?? undefined,
      operationType: searchForm.operationType ?? undefined,
      resultStatus: searchForm.resultStatus ?? undefined,
      startTime: searchForm.startTime || undefined,
      endTime: searchForm.endTime || undefined,
    })
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
  searchForm.startTime = ''
  searchForm.endTime = ''
  handleSearch()
}

function handleModuleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.moduleName = value || null
  handleSearch()
}

function handleOperationTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.operationType = value || null
  handleSearch()
}

function handleResultStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.resultStatus = value ? value as 'SUCCESS' | 'FAILED' : null
  handleSearch()
}

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div class="operation-log-view">
    <PageHeader
      title="操作日志"
      description="追踪管理员、心理助理和咨询师的关键业务操作，支持按模块、操作类型和结果筛选。"
    />

    <n-card title="搜索筛选">
      <div class="search-panel">
        <label class="search-field">
          <span>操作人</span>
          <input
            v-model="searchForm.operatorName"
            type="text"
            placeholder="姓名关键词"
            @keyup.enter="handleSearch"
          >
        </label>

        <label class="search-field">
          <span>模块</span>
          <select :value="searchForm.moduleName ?? ''" @change="handleModuleChange">
            <option value="">全部</option>
            <option v-for="option in moduleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>操作类型</span>
          <select :value="searchForm.operationType ?? ''" @change="handleOperationTypeChange">
            <option value="">全部</option>
            <option v-for="option in operationTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>结果状态</span>
          <select :value="searchForm.resultStatus ?? ''" @change="handleResultStatusChange">
            <option value="">全部</option>
            <option v-for="option in resultStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>时间范围</span>
          <div class="date-range">
            <input v-model="searchForm.startTime" type="date" @change="handleSearch">
            <span>至</span>
            <input v-model="searchForm.endTime" type="date" @change="handleSearch">
          </div>
        </label>
      </div>

      <div class="search-actions">
        <n-button @click="handleReset">重置</n-button>
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>
    </n-card>

    <n-card title="操作记录" style="margin-top: 16px">
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
.operation-log-view {
  padding: 16px;
}

.search-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

.search-field input,
.search-field select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range input {
  min-width: 0;
  flex: 1;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
