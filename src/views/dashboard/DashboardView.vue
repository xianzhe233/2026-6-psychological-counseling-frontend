<script setup lang="ts">
import { NCard, NGrid, NGridItem } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div>
    <page-header title="工作台" description="查看学生预约、管理员审核、咨询安排、结案报告与统计分析等核心业务入口。" />
    <n-grid cols="1 s:2 l:3" responsive="screen" :x-gap="16" :y-gap="16">
      <n-grid-item>
        <n-card title="学生服务">支持首访登记、知情同意、预约提交、预约查询与通知查看。</n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="中心管理">支持基础配置、预约审核、结案报告管理、统计看板与日志查询。</n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="咨询流程">覆盖初访任务、正式咨询安排、咨询记录、追加申请与结案管理。</n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
