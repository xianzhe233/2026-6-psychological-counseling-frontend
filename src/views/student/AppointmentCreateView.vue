<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAlert, NCard } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'

const route = useRoute()

const formId = computed(() => {
  const rawValue = Array.isArray(route.query.formId) ? route.query.formId[0] : route.query.formId
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})
</script>

<template>
  <div class="appointment-create-view">
    <PageHeader title="初访预约" description="选择合适的时间段进行预约" />
    <n-card class="appointment-card">
      <n-alert v-if="formId" type="success" class="appointment-alert">
        已接收首访登记表编号 {{ formId }}，后续可直接基于该编号完成可预约时段查询与预约提交。
      </n-alert>
      <n-alert v-else type="warning" class="appointment-alert">
        当前未携带 formId。正式联调时应从“知情同意书”页面完成签署后进入此页。
      </n-alert>
      <p>初访预约页面骨架已就绪，后续将在此接入日期选择、可预约时段与预约提交功能。</p>
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

.appointment-alert {
  margin-bottom: 16px;
}
</style>
