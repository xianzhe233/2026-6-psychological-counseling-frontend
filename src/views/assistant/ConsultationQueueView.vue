<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NPopconfirm,
  NSpace,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  deferConsultationQueue,
  getConsultationProblemTypeOptions,
  pageConsultationQueue,
} from '@/api/assistant'
import type { ConsultationQueueVO, QueueStatus, RiskLevel } from '@/api/assistant'
import type { OptionItem } from '@/api/admin'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const data = ref<ConsultationQueueVO[]>([])
const problemTypeOptions = ref<OptionItem[]>([])

const searchForm = reactive({
  keyword: '',
  crisisLevel: null as RiskLevel | null,
  problemTypeId: null as number | null,
  status: null as QueueStatus | null,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [5, 10, 20],
  showSizePicker: true,
})

const crisisLevelOptions = [
  { label: '低风险', value: 'LOW' },
  { label: '中风险', value: 'MEDIUM' },
  { label: '高风险', value: 'HIGH' },
  { label: '紧急风险', value: 'URGENT' },
]

const statusOptions = [
  { label: '排队中', value: 'WAITING' },
  { label: '已安排', value: 'ARRANGED' },
  { label: '已暂缓', value: 'SUSPENDED' },
]

const columns: DataTableColumns<ConsultationQueueVO> = [
  {
    title: '学生信息',
    key: 'student',
    width: 100,
    render(row) {
      return h('div', { class: 'queue-cell' }, [
        h('div', { class: 'queue-cell__main' }, row.studentName),
        h('div', { class: 'queue-cell__sub' }, row.studentNo),
      ])
    },
  },
  {
    title: '咨询信息',
    key: 'problem',
    width: 150,
    render(row) {
      return h('div', { class: 'queue-cell' }, [
        h('div', { class: 'queue-cell__main' }, row.problemTypeName),
        h(RiskTag, { value: row.crisisLevel }),
        h('div', { class: 'queue-cell__sub' }, `优先级 ${row.priorityScore}`),
        h('div', { class: 'queue-cell__sub' }, row.enqueueTime),
      ])
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h('div', { class: 'queue-actions' }, [
        h(StatusTag, { value: row.queueStatus, type: 'queue' }),
        h(NSpace, { size: 'small', wrapItem: false }, {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                disabled: row.queueStatus === 'ARRANGED',
                onClick: () => handleArrange(row),
              },
              { default: () => row.queueStatus === 'ARRANGED' ? '已安排' : '安排' },
            ),
            row.queueStatus === 'WAITING'
              ? h(
                NPopconfirm,
                { onPositiveClick: () => handleDefer(row) },
                {
                  trigger: () => h(NButton, { size: 'small', type: 'warning' }, { default: () => '暂缓' }),
                  default: () => '确定暂缓该学生的正式咨询安排吗？',
                },
              )
              : null,
          ].filter(Boolean)
        }),
      ])
    },
  },
]

function rowClassName(row: ConsultationQueueVO) {
  return ['HIGH', 'URGENT'].includes(row.crisisLevel) ? 'high-risk-row' : ''
}

async function fetchProblemTypes() {
  try {
    problemTypeOptions.value = await getConsultationProblemTypeOptions()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载问题类型失败')
  }
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageConsultationQueue({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      crisisLevel: searchForm.crisisLevel,
      problemTypeId: searchForm.problemTypeId,
      status: searchForm.status,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询队列失败')
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
  searchForm.crisisLevel = null
  searchForm.problemTypeId = null
  searchForm.status = null
  handleSearch()
}

function handleCrisisLevelChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.crisisLevel = value ? value as RiskLevel : null
  handleSearch()
}

function handleProblemTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.problemTypeId = value ? Number(value) : null
  handleSearch()
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.status = value ? value as QueueStatus : null
  handleSearch()
}

function handleArrange(row: ConsultationQueueVO) {
  router.push(`/assistant/queue/${row.id}/arrange`)
}

async function handleDefer(row: ConsultationQueueVO) {
  try {
    await deferConsultationQueue(row.id)
    message.success('已暂缓该队列记录')
    await fetchData()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '暂缓失败')
  }
}

onMounted(() => {
  void fetchProblemTypes()
  void fetchData()
})
</script>

<template>
  <div class="consultation-queue-view">
    <PageHeader
      title="咨询队列"
      description="查看初访后需要进入正式咨询的学生，并完成正式咨询安排或暂缓处理。"
    />

    <n-card title="搜索筛选">
      <div class="search-panel">
        <label class="search-field">
          <span>关键词</span>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="姓名 / 学号 / 院系 / 摘要"
            @keyup.enter="handleSearch"
          >
        </label>

        <label class="search-field">
          <span>危机等级</span>
          <select :value="searchForm.crisisLevel ?? ''" @change="handleCrisisLevelChange">
            <option value="">全部</option>
            <option v-for="option in crisisLevelOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>问题类型</span>
          <select :value="searchForm.problemTypeId ?? ''" @change="handleProblemTypeChange">
            <option value="">全部</option>
            <option v-for="option in problemTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>队列状态</span>
          <select :value="searchForm.status ?? ''" @change="handleStatusChange">
            <option value="">全部</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <div class="search-actions">
        <n-button @click="handleReset">重置</n-button>
        <n-button type="primary" @click="handleSearch">搜索</n-button>
      </div>
    </n-card>

    <n-card title="队列列表" style="margin-top: 16px">
      <n-data-table
        remote
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :row-class-name="rowClassName"
        :row-key="(row: ConsultationQueueVO) => row.id"
        :bordered="false"
        :scroll-x="370"
        @update:page="(page: number) => { pagination.page = page; fetchData() }"
        @update:page-size="(pageSize: number) => { pagination.pageSize = pageSize; pagination.page = 1; fetchData() }"
      />
    </n-card>
  </div>
</template>

<style scoped>
.consultation-queue-view {
  padding: 16px;
}

.consultation-queue-view :deep(.n-data-table) {
  width: 100%;
}

.search-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #334155;
}

.search-field span {
  font-weight: 600;
}

.search-field input,
.search-field select {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 11px;
  color: #1f2937;
  font: inherit;
  background: #fff;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.consultation-queue-view :deep(.queue-cell) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.consultation-queue-view :deep(.queue-cell__main) {
  color: #1f2937;
  font-weight: 600;
}

.consultation-queue-view :deep(.queue-cell__sub) {
  color: #64748b;
  font-size: 12px;
}

.consultation-queue-view :deep(.queue-actions) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.consultation-queue-view :deep(.queue-actions .n-button) {
  padding: 0 10px;
}

:deep(.high-risk-row td) {
  background: rgba(250, 137, 0, 0.08);
}
</style>
