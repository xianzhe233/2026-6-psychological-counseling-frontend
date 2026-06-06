<script setup lang="ts">
import { NCard, NGrid, NGridItem } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
</script>

<template>
  <div>
    <page-header title="工作台" description="前后端基础骨架已搭建，下面的入口用于验证角色路由是否正常。" />
    <n-grid cols="1 s:2 l:3" responsive="screen" :x-gap="16" :y-gap="16">
      <n-grid-item>
        <n-card title="学生端">首访登记、同意书、预约、通知等页面后续由 `lcw` 在此骨架上实现。</n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="管理员端">值班、审核、统计与日志的公共布局和鉴权入口已预留。</n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="咨询流程">初访员、助理、咨询师三类角色路由已可访问，用于后续联调扩展。</n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>
