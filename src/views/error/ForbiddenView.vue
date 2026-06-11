<script setup lang="ts">
import ErrorStatePage from '@/components/layout/ErrorStatePage.vue'
</script>

<template>
  <ErrorStatePage
    code="403"
    title="无权访问"
    description="当前账号没有访问该页面的权限，请返回工作台或联系管理员。"
  />
</template>
