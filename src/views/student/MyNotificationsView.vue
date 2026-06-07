<script setup lang="ts">
import { NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div class="my-notifications-view">
    <PageHeader title="我的通知" description="查看系统通知和消息" />
    <n-card class="notifications-card">
      <p>我的通知内容将在此处展示</p>
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