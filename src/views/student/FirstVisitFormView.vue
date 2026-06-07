<script setup lang="ts">
import { NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div class="first-visit-form-view">
    <PageHeader title="首访登记表" description="填写基本信息以便我们了解您的情况" />
    <n-card class="form-card">
      <p>首访登记表内容将在此处展示</p>
    </n-card>
  </div>
</template>

<style scoped>
.first-visit-form-view {
  padding: 24px;
}

.form-card {
  margin-top: 24px;
}
</style>