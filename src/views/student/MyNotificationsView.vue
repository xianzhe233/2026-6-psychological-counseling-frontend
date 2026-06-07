<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NDataTable, NTag, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getMyNotifications } from '@/api/student'
import type { Notification } from '@/types/student'

const message = useMessage()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const columns = [
  { title: '标题', key: 'title', width: 200 },
  { title: '内容', key: 'content', width: 300 },
  { 
    title: '类型', 
    key: 'notifyType', 
    width: 120,
    render(row: Notification) {
      const typeMap: Record<string, { label: string; type: string }> = {
        SYSTEM: { label: '系统通知', type: 'info' },
        APPOINTMENT: { label: '预约通知', type: 'warning' },
        RESULT: { label: '结果通知', type: 'success' }
      }
      const type = typeMap[row.notifyType] || { label: row.notifyType, type: 'default' }
      return h(NTag, { type: type.type as any }, { default: () => type.label })
    }
  },
  { title: '发送时间', key: 'sendTime', width: 180 }
]

async function fetchNotifications() {
  loading.value = true
  try {
    const { data } = await getMyNotifications({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    notifications.value = data.data.records
    total.value = data.data.total
  } catch (error) {
    console.error('获取通知列表失败', error)
    message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pageNum.value = page
  fetchNotifications()
}

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
          showSizePicker: true,
          pageSizes: [10, 20, 50],
          onUpdatePage: handlePageChange,
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