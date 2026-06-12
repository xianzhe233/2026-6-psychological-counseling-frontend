import { reactive } from 'vue'

export interface TablePaginationOptions {
  page?: number
  pageSize?: number
  pageSizes?: number[]
  showSizePicker?: boolean
}

export interface TablePaginationState {
  page: number
  pageSize: number
  itemCount: number
  pageSizes: number[]
  showSizePicker: boolean
}

export function useTablePagination(options: TablePaginationOptions = {}) {
  const pagination = reactive<TablePaginationState>({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 10,
    itemCount: 0,
    pageSizes: options.pageSizes ?? [5, 10, 20, 50],
    showSizePicker: options.showSizePicker ?? true,
  })

  function resetPage() {
    pagination.page = 1
  }

  function setTotal(total: number) {
    pagination.itemCount = total
  }

  function getPageQuery() {
    return {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  function bindRemoteTable(fetchData: () => void | Promise<void>) {
    return {
      onUpdatePage: (page: number) => {
        pagination.page = page
        void fetchData()
      },
      onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize
        pagination.page = 1
        void fetchData()
      },
    }
  }

  function createLegacyHandlers(fetchData: () => void | Promise<void>) {
    return {
      onChange: (page: number) => {
        pagination.page = page
        void fetchData()
      },
      onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize
        pagination.page = 1
        void fetchData()
      },
    }
  }

  return {
    pagination,
    resetPage,
    setTotal,
    getPageQuery,
    bindRemoteTable,
    createLegacyHandlers,
  }
}
