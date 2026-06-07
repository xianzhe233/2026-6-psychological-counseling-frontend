<script setup lang="ts">
import { NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div class="my-appointments-view">
    <PageHeader title="我的预约" description="查看和管理您的预约记录" />
    <n-card class="appointments-card">
      <p>我的预约内容将在此处展示</p>
    </n-card>
  </div>
</template>

<style scoped>
.my-appointments-view {
  padding: 24px;
}

.appointments-card {
  margin-top: 24px;
}
</style>