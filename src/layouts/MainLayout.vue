<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutHeader, NLayoutSider } from 'naive-ui'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <n-layout has-sider class="main-layout">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="80" :width="240" content-style="padding: 18px;">
      <app-sidebar />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered>
        <app-header />
      </n-layout-header>
      <n-layout-content class="main-layout__content" content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
