<script setup lang="ts">
import { reactive } from 'vue'
import { NButton, NCard, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import FormField from '@/components/ui/FormField.vue'
import { getDefaultRouteByRoles, login } from '@/stores/auth'

const message = useMessage()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: 'admin',
  password: '123456',
  loading: false,
})

async function handleLogin() {
  form.loading = true
  try {
    const user = await login({ username: form.username, password: form.password })
    message.success(`登录成功，当前角色：${user.primaryRole}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : getDefaultRouteByRoles(user.roles)
    router.push(redirect)
  } catch (error: any) {
    message.error(error?.response?.data?.message || error?.message || '登录失败')
  } finally {
    form.loading = false
  }
}
</script>

<template>
  <n-card class="login-card" :bordered="false">
    <template #header>
      <div class="login-card__header">
        <h2>登录系统</h2>
        <p class="login-card__subtitle">使用学号或工号登录心理咨询管理平台</p>
      </div>
    </template>

    <form class="login-card__form" @submit.prevent="handleLogin">
      <FormField label="用户名">
        <n-input v-model:value="form.username" placeholder="请输入用户名" size="large" />
      </FormField>

      <FormField label="密码">
        <n-input
          v-model:value="form.password"
          type="password"
          show-password-on="click"
          placeholder="请输入密码"
          size="large"
        />
      </FormField>

      <n-button block type="primary" size="large" attr-type="submit" :loading="form.loading">
        登录
      </n-button>
    </form>

    <p class="login-card__footer">
      首次使用学生端请先完成首访登记与知情同意，再提交初访预约申请。
    </p>
  </n-card>
</template>

<style scoped>
.login-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
