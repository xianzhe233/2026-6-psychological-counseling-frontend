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
import { getNotifyTypeLabel, pageNotificationLogs } from '@/api/logs'
import type { NotificationLogVO } from '@/api/logs'

const message = useMessage()

const loading = ref(false)
const data = ref<NotificationLogVO[]>([])

const searchForm = reactive({
  keyword: '',
  notifyType: null as string | null,
  sendStatus: null as 'SUCCESS' | 'FAILED' | null,
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

const notifyTypeOptions = [
  { label: '预约通过', value: 'APPOINTMENT_APPROVED' },
  { label: '预约驳回', value: 'APPOINTMENT_REJECTED' },
  { label: '咨询安排', value: 'CONSULTATION_ARRANGED' },
  { label: '日程提醒', value: 'SCHEDULE_REMINDER' },
  { label: '结案报告', value: 'CASE_REPORT_SUBMITTED' },
  { label: '队列更新', value: 'QUEUE_UPDATE' },
]

const sendStatusOptions = [
  { label: '发送成功', value: 'SUCCESS' },
  { label: '发送失败', value: 'FAILED' },
]

const columns: DataTableColumns<NotificationLogVO> = [
  { title: '接收人', key: 'receiverName', width: 110 },
  { title: '手机号', key: 'receiverPhone', width: 130 },
  {
    title: '通知类型',
    key: 'notifyType',
    width: 110,
    render(row) {
      return getNotifyTypeLabel(row.notifyType)
    },
  },
  {
    title: '标题',
    key: 'title',
    minWidth: 180,
    ellipsis: { tooltip: true },
  },
  {
    title: '内容',
    key: 'content',
    minWidth: 260,
    ellipsis: { tooltip: true },
  },
  {
    title: '发送状态',
    key: 'sendStatus',
    width: 100,
    render(row) {
      return h(
        NTag,
        { type: row.sendStatus === 'SUCCESS' ? 'success' : 'error', round: true },
        { default: () => row.sendStatus === 'SUCCESS' ? '成功' : '失败' },
      )
    },
  },
  { title: '发送时间', key: 'sendTime', width: 160 },
]

async function fetchData() {
  loading.value = true
  try {
    const result = await pageNotificationLogs({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      notifyType: searchForm.notifyType ?? undefined,
      sendStatus: searchForm.sendStatus ?? undefined,
      startTime: searchForm.startTime || undefined,
      endTime: searchForm.endTime || undefined,
    })
    data.value = result.records
    pagination.itemCount = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载通知日志失败')
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
  searchForm.notifyType = null
  searchForm.sendStatus = null
  searchForm.startTime = ''
  searchForm.endTime = ''
  handleSearch()
}

function handleNotifyTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.notifyType = value || null
  handleSearch()
}

function handleSendStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  searchForm.sendStatus = value ? value as 'SUCCESS' | 'FAILED' : null
  handleSearch()
}

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div class="notification-log-view">
    <PageHeader
      title="通知日志"
      description="查看系统发送给学生的预约、咨询和结案相关通知记录，支持按类型、状态和时间筛选。"
    />

    <n-card title="搜索筛选">
      <div class="search-panel">
        <label class="search-field">
          <span>关键词</span>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="接收人 / 手机号 / 标题 / 内容"
            @keyup.enter="handleSearch"
          >
        </label>

        <label class="search-field">
          <span>通知类型</span>
          <select :value="searchForm.notifyType ?? ''" @change="handleNotifyTypeChange">
            <option value="">全部</option>
            <option v-for="option in notifyTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="search-field">
          <span>发送状态</span>
          <select :value="searchForm.sendStatus ?? ''" @change="handleSendStatusChange">
            <option value="">全部</option>
            <option v-for="option in sendStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
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

    <n-card title="通知记录" style="margin-top: 16px">
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
.notification-log-view {
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
