# 前端架构设计文档

> 项目：高校心理咨询预约与个案管理系统前端  
> 状态：开发前详细设计稿  
> 技术栈：Vue 3 + Vue Router + Naive UI + Axios + ECharts  
> 目标：本文件用于指导前端工程落地，粒度应达到可直接拆任务、建目录、写页面和联调接口的程度。

---

## 1. 前端目标与边界

前端负责实现系统五类角色的 Web 页面、路由、交互、表单校验、状态展示、统计图表和接口调用。

五类角色：

1. 学生：首访登记、知情同意、初访预约、预约记录、通知记录。
2. 中心管理员：人员维护、时间段配置、值班管理、预约审核、风险预警、统计看板、结案报告、日志查询。
3. 初访员：初访任务查看、初访结果录入。
4. 心理助理：咨询队列、正式咨询安排、改约/取消安排。
5. 咨询师：咨询日程、咨询记录、追加咨询申请、结案报告填写。

前端不直接处理数据库，不直接生成 Word/Excel 文件；导出由后端完成，前端负责触发下载和展示结果。

---

## 2. 版本与依赖建议

建议使用 Vite 创建 Vue 3 工程。

| 分类 | 依赖 | 建议版本 | 用途 |
|:--:|:--|:--|:--|
| 构建工具 | vite | 5.x | 前端开发与构建 |
| 框架 | vue | 3.4+ | 页面渲染与组件化 |
| 路由 | vue-router | 4.x | 多角色路由管理 |
| UI | naive-ui | 2.38+ | 表单、表格、弹窗、菜单等 |
| 图标 | @vicons/ionicons5 | 最新 | 菜单和状态图标 |
| 请求 | axios | 1.x | HTTP 请求 |
| 图表 | echarts | 5.x | 统计分析图表 |
| 日期 | dayjs | 1.x | 日期格式化和预约规则判断 |
| 类型检查 | typescript | 5.x | 类型约束（若团队不熟 TS，可使用 JS，但仍建议保留类型文件） |

建议优先使用 TypeScript。若团队成员对 TypeScript 不熟悉，可采用 JavaScript 工程，但仍建议保留 `src/types/` 下的数据结构说明，避免前后端字段混乱。

---

## 3. 推荐目录结构

```text
frontend/
├── docs/
│   ├── architecture.md       # 前端架构设计，本文件
│   ├── api.md                # 前端接口封装与调用说明
│   ├── progress.md           # 前端进度记录
│   ├── pages.md              # 页面级实现清单
│   ├── ui-guidelines.md      # Naive UI 视觉规范与组件规范
│   └── implementation-plan.md# 前端实施计划
├── public/
│   └── logo.svg              # 可选：项目 Logo
├── src/
│   ├── main.ts               # 应用入口，挂载 Naive UI 配置
│   ├── App.vue               # 根组件
│   ├── router/
│   │   ├── index.ts          # 路由表与路由守卫
│   │   └── routes.ts         # 角色路由拆分
│   ├── layouts/
│   │   ├── AuthLayout.vue    # 登录页布局
│   │   ├── MainLayout.vue    # 登录后主布局：侧边栏 + 顶栏 + 内容区
│   │   └── BlankLayout.vue   # 空布局：404/403 等
│   ├── views/
│   │   ├── auth/
│   │   │   └── LoginView.vue
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue
│   │   ├── student/
│   │   │   ├── FirstVisitFormView.vue
│   │   │   ├── ConsentView.vue
│   │   │   ├── AppointmentCreateView.vue
│   │   │   ├── MyAppointmentsView.vue
│   │   │   └── MyNotificationsView.vue
│   │   ├── admin/
│   │   │   ├── UserManageView.vue
│   │   │   ├── StaffManageView.vue
│   │   │   ├── RoomManageView.vue
│   │   │   ├── TimeSlotManageView.vue
│   │   │   ├── DutyScheduleView.vue
│   │   │   ├── AppointmentAuditView.vue
│   │   │   ├── AppointmentDetailView.vue
│   │   │   ├── StatisticsView.vue
│   │   │   ├── CaseReportManageView.vue
│   │   │   ├── NotificationLogView.vue
│   │   │   └── OperationLogView.vue
│   │   ├── interviewer/
│   │   │   ├── InterviewTaskView.vue
│   │   │   └── InterviewResultEditView.vue
│   │   ├── assistant/
│   │   │   ├── ConsultationQueueView.vue
│   │   │   └── ConsultationArrangeView.vue
│   │   ├── counselor/
│   │   │   ├── MyScheduleView.vue
│   │   │   ├── ConsultationRecordEditView.vue
│   │   │   ├── ExtensionRequestView.vue
│   │   │   └── CaseReportEditView.vue
│   │   └── error/
│   │       ├── ForbiddenView.vue
│   │       └── NotFoundView.vue
│   ├── components/
│   │   ├── common/
│   │   │   ├── PageHeader.vue
│   │   │   ├── SearchPanel.vue
│   │   │   ├── StatusTag.vue
│   │   │   ├── RiskTag.vue
│   │   │   ├── ConfirmButton.vue
│   │   │   └── EmptyHint.vue
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppHeader.vue
│   │   │   └── BreadcrumbNav.vue
│   │   ├── form/
│   │   │   ├── StudentBasicForm.vue
│   │   │   ├── RiskQuestionForm.vue
│   │   │   └── AppointmentSlotPicker.vue
│   │   └── charts/
│   │       ├── ProblemTypePie.vue
│   │       ├── CrisisLevelBar.vue
│   │       ├── MonthlyTrendLine.vue
│   │       └── CounselorWorkloadBar.vue
│   ├── api/
│   │   ├── http.ts           # Axios 实例、拦截器、错误处理
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── admin.ts
│   │   ├── interviewer.ts
│   │   ├── assistant.ts
│   │   ├── counselor.ts
│   │   ├── statistics.ts
│   │   └── logs.ts
│   ├── stores/
│   │   └── auth.ts           # 不引入 Pinia 时，用 reactive 模块保存登录用户
│   ├── types/
│   │   ├── common.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── appointment.ts
│   │   ├── consultation.ts
│   │   ├── report.ts
│   │   └── statistics.ts
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── status.ts
│   │   ├── menus.ts
│   │   └── options.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── download.ts
│   │   ├── format.ts
│   │   └── validators.ts
│   └── styles/
│       ├── global.css
│       └── theme.css
├── package.json
├── vite.config.ts
└── README.md
```

目录设计原则：

- `views/` 只放页面组件，页面组件负责组织业务块和调用接口。
- `components/` 放可复用组件，不直接耦合具体页面接口。
- `api/` 统一封装接口，页面不直接写 Axios URL。
- `types/` 统一维护前后端字段结构，降低接口联调成本。
- `constants/` 统一维护角色、状态、下拉选项、菜单配置。
- `utils/` 只放无状态工具函数。

---

## 4. 应用入口设计

`main.ts` 建议职责：

1. 创建 Vue 应用。
2. 注册 Vue Router。
3. 挂载 Naive UI 全局配置。
4. 引入全局样式。

伪代码：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/theme.css'

createApp(App).use(router).mount('#app')
```

Naive UI 的全局消息、弹窗、加载条建议在 `App.vue` 中通过 `n-message-provider`、`n-dialog-provider`、`n-loading-bar-provider`、`n-config-provider` 统一包裹。

`App.vue` 结构建议：

```vue
<n-config-provider :theme-overrides="themeOverrides">
  <n-message-provider>
    <n-dialog-provider>
      <n-loading-bar-provider>
        <router-view />
      </n-loading-bar-provider>
    </n-dialog-provider>
  </n-message-provider>
</n-config-provider>
```

---

## 5. 路由架构

### 5.1 角色编码

前后端统一角色编码：

| 角色 | 编码 | 说明 |
|:--:|:--:|:--|
| 学生 | STUDENT | 学生用户 |
| 中心管理员 | ADMIN | 管理员 |
| 初访员 | INTERVIEWER | 负责初访 |
| 心理助理 | ASSISTANT | 负责正式咨询安排 |
| 咨询师 | COUNSELOR | 负责咨询记录和结案 |

### 5.2 路由 meta 约定

每个需要登录的路由必须配置 `meta.requiresAuth = true`。需要角色限制的路由配置 `meta.roles`。

```ts
{
  path: '/student/appointments',
  name: 'StudentAppointments',
  component: () => import('@/views/student/MyAppointmentsView.vue'),
  meta: {
    requiresAuth: true,
    roles: ['STUDENT'],
    title: '我的预约'
  }
}
```

### 5.3 路由守卫逻辑

路由守卫需要完成：

1. 若目标页面不需要登录，直接放行。
2. 若需要登录但当前没有用户信息，调用 `/api/auth/current`。
3. 当前未登录时跳转 `/login`。
4. 当前已登录但角色不匹配时跳转 `/403`。
5. 设置页面标题。

伪代码：

```ts
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  if (!authState.loaded) {
    await loadCurrentUser()
  }

  if (!authState.user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && !roles.some(role => authState.roles.includes(role))) {
    return { path: '/403' }
  }

  return true
})
```

### 5.4 路由表

核心路由如下：

| 路由 | 页面 | 角色 |
|:--|:--|:--:|
| `/login` | 登录页 | 匿名 |
| `/dashboard` | 工作台 | 全部登录用户 |
| `/student/first-visit-form` | 首访登记表 | STUDENT |
| `/student/consent` | 知情同意书 | STUDENT |
| `/student/appointment-create` | 初访预约 | STUDENT |
| `/student/appointments` | 我的预约 | STUDENT |
| `/student/notifications` | 我的通知 | STUDENT |
| `/admin/users` | 用户管理 | ADMIN |
| `/admin/staff` | 工作人员管理 | ADMIN |
| `/admin/rooms` | 咨询室管理 | ADMIN |
| `/admin/time-slots` | 时间段配置 | ADMIN |
| `/admin/duty-schedules` | 值班管理 | ADMIN |
| `/admin/appointments/audit` | 初访预约审核 | ADMIN |
| `/admin/statistics` | 统计看板 | ADMIN |
| `/admin/case-reports` | 结案报告管理 | ADMIN |
| `/admin/logs/notifications` | 通知日志 | ADMIN |
| `/admin/logs/operations` | 操作日志 | ADMIN |
| `/interviewer/tasks` | 我的初访任务 | INTERVIEWER |
| `/interviewer/tasks/:id/result` | 初访结果录入 | INTERVIEWER |
| `/assistant/queue` | 咨询队列 | ASSISTANT |
| `/assistant/arrange` | 咨询安排 | ASSISTANT |
| `/counselor/schedules` | 我的咨询日程 | COUNSELOR |
| `/counselor/records/:scheduleId` | 咨询记录录入 | COUNSELOR |
| `/counselor/extensions` | 追加咨询申请 | COUNSELOR |
| `/counselor/case-reports` | 结案报告 | COUNSELOR |
| `/403` | 无权限 | 全部 |
| `/:pathMatch(.*)*` | 404 | 全部 |

---

## 6. 布局设计

### 6.1 登录页布局

`AuthLayout.vue` 用于登录页。视觉风格：左侧系统介绍，右侧登录卡片。

建议内容：

- 系统名称：高校心理咨询预约与个案管理系统。
- 简短说明：预约、初访、咨询、结案全流程管理。
- 登录表单：用户名、密码、登录按钮。
- 浅色渐变背景，避免传统后台登录页风格。

### 6.2 主布局

`MainLayout.vue` 结构：

```text
NLayout
├── NLayoutSider：侧边栏菜单
├── NLayout
│   ├── NLayoutHeader：顶部栏，显示面包屑、用户姓名、退出
│   └── NLayoutContent：页面内容
```

主布局要求：

1. 菜单根据当前用户角色生成。
2. 顶部显示当前角色和姓名。
3. 内容区使用浅灰背景，页面卡片使用白色背景。
4. 页面宽度自适应，表格横向滚动而不是撑破布局。
5. 重要操作按钮固定在搜索区或表格操作列。

---

## 7. 状态与数据流

### 7.1 Auth 状态

不强制引入 Pinia。建议使用简单的 `reactive` 模块实现：

```ts
export const authState = reactive({
  loaded: false,
  user: null as CurrentUser | null,
  roles: [] as RoleCode[]
})
```

方法：

- `loadCurrentUser()`：调用 `/api/auth/current`。
- `login(payload)`：调用 `/api/auth/login`，成功后写入 `authState`。
- `logout()`：调用 `/api/auth/logout`，清空 `authState`。
- `hasRole(role)`：判断当前用户是否拥有角色。

### 7.2 页面数据流

页面加载流程统一为：

```text
进入页面
  ↓
初始化查询条件/表单默认值
  ↓
调用 api 层方法
  ↓
loading=true
  ↓
接口返回后写入 tableData/formData/chartData
  ↓
loading=false
  ↓
异常时显示 message.error
```

表格页统一使用：

- `searchForm`：搜索条件。
- `pagination`：分页信息。
- `tableData`：列表数据。
- `loading`：加载状态。
- `selectedRowKeys`：批量操作选择项（如有）。

表单页统一使用：

- `formRef`：表单引用。
- `formModel`：表单模型。
- `rules`：校验规则。
- `submitting`：提交状态。

---

## 8. API 调用架构

### 8.1 Axios 配置

`src/api/http.ts` 统一创建 Axios 实例：

```ts
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true
})
```

必须设置 `withCredentials: true`，否则浏览器不会携带后端 Session Cookie。

### 8.2 响应格式

前端按统一格式处理：

```ts
interface ApiResult<T> {
  code: number
  message: string
  data: T
}
```

成功条件：`code === 200`。

常见错误码约定：

| code | 含义 | 前端处理 |
|:--:|:--|:--|
| 200 | 成功 | 返回 data |
| 400 | 参数错误 | message.error |
| 401 | 未登录 | 跳转登录页 |
| 403 | 无权限 | 跳转 403 页 |
| 404 | 资源不存在 | message.warning 或 404 页 |
| 409 | 业务冲突 | 显示冲突原因，例如时间冲突 |
| 500 | 系统异常 | message.error |

### 8.3 下载接口

Word/Excel 下载统一通过 `downloadFile` 工具处理：

```ts
export async function downloadFile(url: string, params?: Record<string, any>) {
  const res = await http.get(url, { params, responseType: 'blob' })
  // 从 Content-Disposition 获取文件名，若没有则使用默认名
}
```

---

## 9. 组件设计规范

### 9.1 StatusTag

`StatusTag.vue` 用于统一展示预约、队列、咨询、报告等状态。

输入：

```ts
props: {
  value: string,
  type: 'appointment' | 'queue' | 'schedule' | 'report'
}
```

状态颜色示例：

| 状态 | 文案 | 颜色 |
|:--:|:--:|:--:|
| PENDING | 待审核 | info |
| APPROVED | 已通过 | success |
| REJECTED | 已驳回 | error |
| CANCELED | 已撤销 | default |
| COMPLETED | 已完成 | success |
| WAITING | 排队中 | warning |
| ARRANGED | 已安排 | success |
| CLOSED | 已结案 | default |

### 9.2 RiskTag

`RiskTag.vue` 用于风险等级展示。

| 风险等级 | 文案 | Naive UI 类型 | 页面效果 |
|:--:|:--:|:--:|:--|
| LOW | 低风险 | success | 绿色标签 |
| MEDIUM | 中风险 | warning | 黄色标签 |
| HIGH | 高风险 | error | 红色标签 |
| URGENT | 紧急 | error | 红色标签 + 可选闪烁/加粗 |

### 9.3 SearchPanel

搜索区统一使用 `NCard + NSpace + NForm inline`。

要求：

1. 每个表格页顶部放搜索区。
2. 搜索按钮、重置按钮固定在右侧。
3. 搜索项超过 4 个时允许折叠，避免页面过高。

### 9.4 AppointmentSlotPicker

用于学生预约和助理安排咨询时选择时间段。

输入：

- `date`：日期。
- `staffType`：INTERVIEWER 或 COUNSELOR。
- `staffId`：可选。

显示：

- 日期选择器。
- 时间段卡片列表。
- 剩余容量。
- 不可用原因：已满、停用、冲突。

输出：

- `dutyScheduleId`
- `slotId`
- `roomId`
- `appointmentDate`

---

## 10. 业务状态常量

前端状态常量必须与后端一致。

### 10.1 初访预约状态

```ts
export const APPOINTMENT_STATUS = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  CANCELED: '已撤销',
  COMPLETED: '已完成初访'
}
```

### 10.2 风险等级

```ts
export const RISK_LEVEL = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
  URGENT: '紧急风险'
}
```

### 10.3 初访结论

```ts
export const FIRST_VISIT_CONCLUSION = {
  NO_NEED: '无需咨询',
  ARRANGE_CONSULTATION: '安排咨询',
  TRANSFER: '转介送诊'
}
```

### 10.4 咨询安排状态

```ts
export const SCHEDULE_STATUS = {
  RESERVED: '已预约',
  COMPLETED: '完成咨询',
  ABSENT: '旷约',
  LEAVE: '请假',
  DROPPED: '脱落',
  CLOSED: '结案',
  CANCELED: '已取消'
}
```

---

## 11. 表单校验规范

### 11.1 通用校验

- 用户名：必填，2-50 位。
- 密码：必填，6-32 位。
- 手机号：允许空；若填写，必须匹配 11 位手机号。
- 日期：不能早于当前日期（历史记录查询除外）。
- 文本域：摘要类字段最大 1000 字；报告类字段最大 5000 字。

### 11.2 学生预约校验

学生提交初访预约前，前端需检查：

1. 是否已提交首访登记表。
2. 是否已签署知情同意书。
3. 是否选择预约日期和时间段。
4. 是否存在未完成预约：该项以后端结果为准，前端仅展示提示。

### 11.3 初访结果校验

初访员提交结果前需检查：

1. 危机等级必填。
2. 问题类型必填。
3. 初访时间必填。
4. 初访结论必填。
5. 若结论为转介送诊，后续建议必填。

### 11.4 结案报告校验

咨询师提交结案报告前需检查：

1. 问题类型必填。
2. 咨询总次数必填且大于 0。
3. 咨询效果自评必填。
4. 结案类型必填。
5. 个案总结建议不少于 20 字。

---

## 12. UI 风格概要

详细见 `docs/ui-guidelines.md`。

总体要求：

1. 不使用 Element Plus 默认后台风格。
2. 使用 Naive UI 的简约浅色风格。
3. 主色采用蓝绿色，体现心理健康、平静、可信赖。
4. 页面采用卡片式布局，减少强边框。
5. 高风险信息必须醒目，但避免大面积刺眼红色。
6. 表格操作按钮保持简洁，危险操作使用二次确认。

---

## 13. 性能与可维护性要求

1. 路由组件全部使用懒加载。
2. 表格数据全部分页加载，不一次性请求全部数据。
3. 统计图表组件在 tab 或页面激活后再初始化。
4. 表格搜索时防止重复点击，使用 loading 状态。
5. 页面销毁时释放 ECharts 实例。
6. 常用下拉选项如问题类型、时间段、咨询室可在页面初始化时一次性加载，避免重复请求。
7. 大表单拆成子组件，例如首访登记表拆分为基本信息、问题描述、风险问题三个区域。

---

## 14. 开发落地顺序

建议前端按以下顺序开发：

1. 初始化 Vite + Vue 3 + Naive UI 工程。
2. 完成 `MainLayout`、`AuthLayout`、路由守卫、登录页。
3. 完成 API 封装和统一错误处理。
4. 完成学生端主流程：首访登记 → 同意书 → 预约 → 我的预约。
5. 完成管理员端：时间段、值班、预约审核、风险高亮。
6. 完成初访员端：任务列表、结果录入。
7. 完成心理助理端：咨询队列、咨询安排。
8. 完成咨询师端：日程、记录、结案报告。
9. 完成统计看板和日志页面。
10. 统一样式、补充空状态、加载状态和错误提示。

---

## 15. 与后端协作约定

1. 所有接口路径和字段以 `backend/docs/api.md` 为准。
2. 前端新增字段前，应先同步更新 `frontend/docs/api.md` 和 `backend/docs/api.md`。
3. 后端返回枚举值使用英文编码，前端负责映射为中文文案和颜色。
4. Session 鉴权依赖 Cookie，前端 Axios 必须开启 `withCredentials`。
5. 文件下载接口返回 `blob`，前端不能按 JSON 处理。
6. 若后端返回 409，前端需要展示具体冲突原因，如“该咨询师该时间段已有安排”。
