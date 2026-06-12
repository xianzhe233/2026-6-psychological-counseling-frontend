<script setup lang="ts">
import dayjs from 'dayjs'
import { h, onMounted, reactive, ref } from 'vue'
import {
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

import DataTablePage from '@/components/ui/DataTablePage.vue'
import { useTablePagination } from '@/composables/useTablePagination'
import { getNotifyTypeLabel, pageNotificationLogs } from '@/api/logs'
import type { NotificationLogQuery, NotificationLogVO } from '@/api/logs'

const message = useMessage()

const loading = ref(false)
const data = ref<NotificationLogVO[]>([])

const searchForm = reactive({
  keyword: '',
  notifyType: null as string | null,
  sendStatus: null as 'SUCCESS' | 'FAILED' | null,
  dateRange: null as [number, number] | null,
})

const { pagination, setTotal, resetPage, bindRemoteTable } = useTablePagination()

const notifyTypeOptions = [
  { label: '预约通过', value: 'APPOINTMENT_APPROVED' },
  { label: '预约驳回', value: 'APPOINTMENT_REJECTED' },
  { label: '预约改约', value: 'APPOINTMENT_RESCHEDULED' },
  { label: '咨询安排', value: 'CONSULTATION_ARRANGED' },
  { label: '咨询取消', value: 'CONSULTATION_CANCELED' },
  { label: '追加通过', value: 'EXTENSION_APPROVED' },
  { label: '追加驳回', value: 'EXTENSION_REJECTED' },
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
  { title: '手机号', key: 'phone', width: 130 },
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

function buildQuery(): NotificationLogQuery {
  return {
    pageNum: pagination.page,
    pageSize: pagination.pageSize,
    keyword: searchForm.keyword.trim() || undefined,
    notifyType: searchForm.notifyType ?? undefined,
    sendStatus: searchForm.sendStatus ?? undefined,
    startTime: searchForm.dateRange ? dayjs(searchForm.dateRange[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
    endTime: searchForm.dateRange ? dayjs(searchForm.dateRange[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
  }
}

async function fetchData() {
  loading.value = true
  try {
    const result = await pageNotificationLogs(buildQuery())
    data.value = result.records
    setTotal(result.total)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载通知日志失败')
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
  searchForm.notifyType = null
  searchForm.sendStatus = null
  searchForm.dateRange = null
  handleSearch()
}

onMounted(() => {
  void fetchData()
})
</script>

<template>
  <DataTablePage
    title="通知日志"
    description="查看系统发送给学生的预约、咨询和结案相关通知记录，支持按类型、状态和时间筛选。"
    table-title="通知记录"
    :loading="loading"
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :row-key="(row: NotificationLogVO) => row.id"
    empty-title="暂无通知记录"
    @search="handleSearch"
    @reset="handleReset"
    @update:page="onUpdatePage"
    @update:page-size="onUpdatePageSize"
  >
    <template #search>
      <n-form label-placement="top">
        <n-grid :cols="1" :x-gap="16" responsive="screen" item-responsive>
          <n-gi span="1 m:1">
            <n-form-item label="关键词">
              <n-input v-model:value="searchForm.keyword" placeholder="接收人 / 手机号 / 标题 / 内容" clearable @keyup.enter="handleSearch" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:1">
            <n-form-item label="通知类型">
              <n-select v-model:value="searchForm.notifyType" :options="notifyTypeOptions" clearable placeholder="全部类型" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:1">
            <n-form-item label="发送状态">
              <n-select v-model:value="searchForm.sendStatus" :options="sendStatusOptions" clearable placeholder="全部状态" />
            </n-form-item>
          </n-gi>
          <n-gi span="1 m:2">
            <n-form-item label="时间范围">
              <n-date-picker v-model:value="searchForm.dateRange" type="daterange" clearable style="width: 100%" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </template>
  </DataTablePage>
</template>
