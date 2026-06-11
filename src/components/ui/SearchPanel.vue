<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard, NIcon, NSpace } from 'naive-ui'
import { ChevronDownOutline, ChevronUpOutline, SearchOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title?: string
    collapsible?: boolean
    defaultCollapsed?: boolean
    showSearch?: boolean
    showReset?: boolean
    searchText?: string
    resetText?: string
    loading?: boolean
  }>(),
  {
    title: '搜索筛选',
    collapsible: false,
    defaultCollapsed: false,
    showSearch: true,
    showReset: true,
    searchText: '搜索',
    resetText: '重置',
    loading: false,
  },
)

const emit = defineEmits<{
  search: []
  reset: []
}>()

const collapsed = ref(false)

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function handleSearch() {
  emit('search')
}

function handleReset() {
  emit('reset')
}
</script>

<template>
  <n-card class="ui-search-panel" :title="title" :bordered="false">
    <template v-if="collapsible" #header-extra>
      <n-button quaternary size="small" @click="toggleCollapse">
        <template #icon>
          <n-icon :component="collapsed ? ChevronDownOutline : ChevronUpOutline" />
        </template>
        {{ collapsed ? '展开' : '收起' }}
      </n-button>
    </template>

    <div v-show="!collapsed">
      <div class="ui-search-panel__grid">
        <slot />
      </div>

      <div v-if="showSearch || showReset || $slots.actions" class="ui-search-panel__actions">
        <slot name="actions" />
        <n-space>
          <n-button v-if="showReset" :disabled="loading" @click="handleReset">
            {{ resetText }}
          </n-button>
          <n-button
            v-if="showSearch"
            type="primary"
            :loading="loading"
            @click="handleSearch"
          >
            <template #icon>
              <n-icon :component="SearchOutline" />
            </template>
            {{ searchText }}
          </n-button>
        </n-space>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.ui-search-panel {
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
</style>
