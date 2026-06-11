<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { NDataTable } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SearchPanel from '@/components/ui/SearchPanel.vue'
import SectionCard from '@/components/ui/SectionCard.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    tableTitle?: string
    searchTitle?: string
    loading?: boolean
    columns: DataTableColumns
    data: unknown[]
    pagination?: object | false
    rowKey?: string | ((row: unknown) => string | number)
    bordered?: boolean
    scrollX?: number | string
    remote?: boolean
    showSearch?: boolean
    showEmpty?: boolean
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    tableTitle: '数据列表',
    searchTitle: '搜索筛选',
    loading: false,
    bordered: false,
    remote: true,
    showSearch: true,
    showEmpty: true,
    emptyTitle: '暂无数据',
    emptyDescription: '当前筛选条件下没有记录。',
  },
)

const emit = defineEmits<{
  search: []
  reset: []
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
}>()

function handleUpdatePage(page: number) {
  emit('update:page', page)
}

function handleUpdatePageSize(pageSize: number) {
  emit('update:page-size', pageSize)
}
</script>

<template>
  <div class="ui-data-table-page">
    <PageHeader :title="title" :description="description">
      <slot name="header-actions" />
    </PageHeader>

    <SearchPanel
      v-if="showSearch"
      :title="searchTitle"
      :loading="loading"
      @search="emit('search')"
      @reset="emit('reset')"
    >
      <slot name="search" />
      <template v-if="$slots['search-actions']" #actions>
        <slot name="search-actions" />
      </template>
    </SearchPanel>

    <SectionCard :title="tableTitle" class="ui-data-table-page__table-card">
      <template v-if="$slots['table-extra']" #extra>
        <slot name="table-extra" />
      </template>

      <EmptyState
        v-if="showEmpty && !loading && data.length === 0"
        :title="emptyTitle"
        :description="emptyDescription"
      />

      <n-data-table
        v-else
        :remote="remote"
        :loading="loading"
        :columns="columns"
        :data="data"
        :pagination="pagination === false ? false : pagination"
        :row-key="rowKey"
        :bordered="bordered"
        :scroll-x="scrollX"
        @update:page="handleUpdatePage"
        @update:page-size="handleUpdatePageSize"
      />
    </SectionCard>
  </div>
</template>

<style scoped>
.ui-data-table-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ui-data-table-page__table-card {
  margin-top: var(--space-1);
}
</style>
