<script setup lang="ts">
import { reactive } from 'vue'
import { NButton, NCard, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import { getDefaultRouteByRoles, login } from '@/stores/auth'

const message = useMessage()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: 'admin',
  password: '123456',
  loading: false
})

async function handleLogin() {
  form.loading = true
  try {
    const user = await login({ username: form.username, password: form.password })
    message.success(`登录成功，当前角色：${user.primaryRole}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : getDefaultRouteByRoles(user.roles)
    router.push(redirect)
  } catch (error: any) {
    // 暂时把真实错误抛到页面，先定位登录失败来源。
    console.error('login failed', error)
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
      </div>
    </template>
    <n-form @submit.prevent="handleLogin">
      <n-form-item label="用户名">
        <n-input v-model:value="form.username" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="密码">
        <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码" />
      </n-form-item>
      <n-button block type="primary" attr-type="submit" :loading="form.loading">登录</n-button>
    </n-form>
  </n-card>
</template>
