<script setup lang="ts">
import { NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div class="consent-view">
    <PageHeader title="知情同意书" description="请仔细阅读以下内容并签署同意" />
    <n-card class="consent-card">
      <p>知情同意书内容将在此处展示</p>
    </n-card>
  </div>
</template>

<style scoped>
.consent-view {
  padding: 24px;
}

.consent-card {
  margin-top: 24px;
}
</style>