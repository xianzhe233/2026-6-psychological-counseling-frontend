<script setup lang="ts">
import { NConfigProvider, NDialogProvider, NLoadingBarProvider, NMessageProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1f8f6a',
    primaryColorHover: '#2aa17a',
    primaryColorPressed: '#167255',
    borderRadius: '12px',
    bodyColor: '#f4f7f1',
  },
  Card: {
    borderRadius: '18px',
  },
  Button: {
    borderRadiusMedium: '10px',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-loading-bar-provider>
          <router-view />
        </n-loading-bar-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
