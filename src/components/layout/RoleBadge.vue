<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { getRoleLabel } from '@/constants/role-labels'
import type { RoleCode } from '@/types/auth'

const props = withDefaults(
  defineProps<{
    role: RoleCode | string
    size?: 'small' | 'medium' | 'large'
    round?: boolean
  }>(),
  {
    size: 'small',
    round: true,
  },
)

const tagType = computed(() => {
  const map: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    STUDENT: 'info',
    ADMIN: 'success',
    INTERVIEWER: 'warning',
    ASSISTANT: 'default',
    COUNSELOR: 'success',
  }
  return map[props.role] ?? 'default'
})
</script>

<template>
  <n-tag class="shell-role-badge" :type="tagType" :size="size" :round="round">
    {{ getRoleLabel(role) }}
  </n-tag>
</template>

<style scoped>
.shell-role-badge {
  font-weight: var(--font-weight-semibold);
}
</style>
