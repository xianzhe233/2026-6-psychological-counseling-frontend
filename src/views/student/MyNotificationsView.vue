<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NTag, NSpace, NEmpty } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyNotifications } from '@/api/student'
import type { Notification } from '@/types/student'

const notifications = ref<Notification[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 表格列定义
const columns = [
  {
    title: '标题',
    key: 'title',
    width: 200
  },
  {
    title: '内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '通知类型',
    key: 'notifyType',
    width: 120,
    render(row: Notification) {
      const typeMap: Record<string, { label: string; type: string }> = {
        APPOINTMENT_APPROVED: { label: '预约通过', type: 'success' },
        APPOINTMENT_REJECTED: { label: '预约驳回', type: 'error' },
        APPOINTMENT_RESCHEDULED: { label: '改约通知', type: 'warning' },
        APPOINTMENT_CANCELED: { label: '预约取消', type: 'default' },
        SYSTEM: { label: '系统通知', type: 'info' }
      }
      const type = typeMap[row.notifyType] || { label: row.notifyType, type: 'default' }
      return h(NTag, { type: type.type as any, size: 'small' }, { default: () => type.label })
    }
  },
  {
    title: '发送时间',
    key: 'sendTime',
    width: 180
  },
  {
    title: '状态',
    key: 'readStatus',
    width: 100,
    render(row: Notification) {
      return h(NTag, {
        type: row.readStatus === 0 ? 'warning' : 'success',
        size: 'small'
      }, { default: () => row.readStatus === 0 ? '未读' : '已读' })
    }
  }
]

// 获取通知列表
async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await getMyNotifications({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    notifications.value = data.data?.records || []
    total.value = data.data?.total || 0
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页码变化
function handlePageChange(page: number) {
  pageNum.value = page
  fetchNotifications()
}

// 每页数量变化
function handlePageSizeChange(size: number) {
  pageSize.value = size
  pageNum.value = 1
  fetchNotifications()
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="my-notifications-view">
    <PageHeader title="我的通知" description="查看系统通知和消息" />
    <n-card class="notifications-card">
      <n-data-table
        :columns="columns"
        :data="notifications"
        :loading="loading"
        :pagination="{
          page: pageNum,
          pageSize: pageSize,
          itemCount: total,
          onChange: handlePageChange,
          onUpdatePageSize: handlePageSizeChange
        }"
        :row-key="(row: Notification) => row.id"
      />
    </n-card>
  </div>
</template>

<style scoped>
.my-notifications-view {
  padding: 24px;
}

.notifications-card {
  margin-top: 24px;
}
</style>