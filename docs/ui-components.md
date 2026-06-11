# 共享 UI 组件库

> PR-2：共享组件库 + 状态图标体系  
> 分支：`dev-zyt`  
> 类型：前端 UI 基础设施（无业务逻辑变更）

本目录组件位于 `src/components/ui/`，配合 `src/styles/ui-components.css` 与设计令牌使用。

---

## 快速导入

```ts
import {
  SearchPanel,
  SectionCard,
  DataTablePage,
  EmptyState,
  StatCard,
  ConflictAlert,
} from '@/components/ui'
```

```ts
import { useTablePagination } from '@/composables/useTablePagination'
import { useSearchForm } from '@/composables/useSearchForm'
import { pageIcons } from '@/constants/icons'
import { appointmentStatusMap, riskLevelMap } from '@/constants/status-colors'
```

---

## 布局与页面壳

| 组件 | 用途 |
|------|------|
| `PageContainer` | 统一页面内边距与最大宽度 |
| `SectionCard` | 带标题/副标题的卡片容器 |
| `DataTablePage` | PageHeader + SearchPanel + Table 标准列表页模板 |
| `ActionBar` | 底部固定操作栏（保存/取消） |

## 搜索与筛选

| 组件 | 用途 |
|------|------|
| `SearchPanel` | 搜索区标准壳，支持折叠、搜索/重置 |
| `FilterTags` | 已选筛选条件 Tag 展示 |
| `DateRangePicker` | 日期范围选择封装 |

## 表单

| 组件 | 用途 |
|------|------|
| `FormSection` | 表单分区标题与描述 |
| `FormField` | label + 必填 + hint + error 统一结构 |

## 数据展示

| 组件 | 用途 |
|------|------|
| `EmptyState` | 空数据状态 |
| `LoadingSkeleton` | 表格/卡片/表单骨架屏 |
| `StatCard` | 指标统计卡片 |
| `InfoDescriptions` | 键值对详情展示 |
| `TimelineItem` | 时间线单项 |
| `PriorityBadge` | 队列优先级可视化 |

## 交互

| 组件 | 用途 |
|------|------|
| `ConfirmButton` | 带二次确认的按钮 |
| `ConflictAlert` | 咨询安排冲突提示 |
| `FileDownloadButton` | Word/文件下载按钮样式 |

---

## 状态标签（`src/components/common/`）

| 组件 | 用途 |
|------|------|
| `StatusTag` | 预约/队列/日程/报告通用状态 |
| `RiskTag` | 危机等级 LOW/MEDIUM/HIGH/URGENT |
| `AppointmentStatusTag` | 学生端预约状态专用 |

颜色映射统一在 `src/constants/status-colors.ts`。

---

## Composables

### `useTablePagination`

```ts
const { pagination, resetPage, setTotal, bindRemoteTable } = useTablePagination()

async function fetchData() {
  const result = await api({ ...getPageQuery() })
  setTotal(result.total)
}

const { onUpdatePage, onUpdatePageSize } = bindRemoteTable(fetchData)
```

### `useSearchForm`

```ts
const { form, reset, search } = useSearchForm({
  initial: { keyword: '', status: null },
  onSearch: fetchData,
})
```

---

## 图标体系

`src/constants/icons.ts` 提供 `pageIcons` 与 `roleMenuIcons`，`menus.ts` 已接入差异化图标。

---

## 后续 PR 接入建议

- **PR-5（业务域）**：`ConsultationQueueView` 接入 `SearchPanel` + `PriorityBadge`；`ConsultationArrangeView` 接入 `ConflictAlert` + `InfoDescriptions` ✅
- **PR-3（壳层）**：`DashboardView` 接入 `StatCard`；壳层组件 `RoleBadge` / `DashboardWelcome` / `QuickLinkCard` / `ErrorStatePage` ✅
- **PR-4（管理员）**：CRUD 页接入 `DataTablePage` ✅

接入时仅替换 UI 壳层，不改 API 参数与提交逻辑。
