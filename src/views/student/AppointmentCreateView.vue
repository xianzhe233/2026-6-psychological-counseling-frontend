<script setup lang="ts">
import { NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div class="appointment-create-view">
    <PageHeader title="初访预约" description="选择合适的时间段进行预约" />
    <n-card class="appointment-card">
      <p>初访预约内容将在此处展示</p>
    </n-card>
  </div>
</template>

<style scoped>
.appointment-create-view {
  padding: 24px;
}

.appointment-card {
  margin-top: 24px;
}
</style>