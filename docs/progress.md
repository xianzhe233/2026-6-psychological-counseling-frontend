# 前端进度记录

> 本文件记录前端开发进度。

---

## 2026-06-06 文档设计阶段

### 已完成

- [x] 确定 UI 组件库采用 Naive UI。
- [x] 确定前端技术栈：Vue 3 + Vue Router + Naive UI + Axios + ECharts。
- [x] 完成前端架构文档：`docs/architecture.md`。
- [x] 完成前端接口调用文档：`docs/api.md`。
- [x] 完成页面级实现清单：`docs/pages.md`。
- [x] 完成 UI 与交互规范：`docs/ui-guidelines.md`。
- [x] 完成前端实施计划：`docs/implementation-plan.md`。

### 当前状态

前端仓库当前 `dev-qxz` 基线已包含：
- 学生端首访登记、知情同意、初访预约、我的预约、我的通知页面，学生端主流程已接入真实后端接口；
- 管理员用户、工作人员、咨询室、时间段、值班管理与初访预约审核页面，其中基础管理、值班和审核操作已接入真实后端接口；
- 初访员任务、初访结果、心理助理咨询队列/安排、咨询师日程/记录/追加/结案报告、统计看板与日志页面；
- 当前技术债重点：初访员、心理助理、咨询师、统计与日志页面仍有部分前端 API 使用 mock 数据，需要在后端阶段5/6接口稳定后继续切换真实接口。

本轮 review 已清理生产调试输出，并对 Vite 构建设置合理的 `chunkSizeWarningLimit`，消除统计页在当前依赖规模下的无效体积告警。

---

## 待开发任务总览

### 阶段一：基础框架

- [x] 初始化 Vite + Vue 3 工程。
- [x] 安装 Vue Router、Naive UI、Axios、ECharts、dayjs。
- [x] 配置路径别名和环境变量。
- [x] 创建登录页布局 `AuthLayout.vue`。
- [x] 创建主布局 `MainLayout.vue`。
- [x] 创建侧边栏 `AppSidebar.vue`。
- [x] 创建顶栏 `AppHeader.vue`。
- [x] 配置角色路由和路由守卫。
- [x] 封装 Axios 实例和错误处理。
- [x] 封装 auth 状态模块。

### 阶段二：学生端

- [x] 首访登记表页面。
- [x] 知情同意书页面。
- [x] 初访预约页面（当前为骨架页，已支持接收 `formId`）。
- [x] 可预约时间段选择组件。
- [x] 我的预约页面。
- [x] 我的通知页面。

### 阶段三：管理员端

- [x] 用户管理页面。
- [x] 工作人员管理页面。
- [x] 咨询室管理页面。
- [x] 时间段配置页面。
- [x] 值班管理页面。
- [x] 初访预约审核页面。
- [x] 预约详情抽屉。
- [x] 风险等级高亮展示。
- [x] 结案报告管理页面。
- [x] 通知日志页面。
- [x] 操作日志页面。

### 阶段四：初访员端

- [x] 我的初访任务页面。
- [x] 初访结果录入页面。

### 阶段五：心理助理端

- [x] 咨询队列页面。
- [x] 咨询安排页面。
- [x] 咨询时段预览表。
- [x] 冲突结果展示。

### 阶段六：咨询师端

- [x] 我的咨询日程页面。
- [x] 咨询记录录入页面。
- [x] 追加咨询申请页面。
- [x] 结案报告填写页面。
- [x] Word 下载触发功能。

### 阶段七：统计与收尾

- [x] 统计看板页面。
- [x] 月度趋势折线图。
- [x] 问题类型饼图。
- [x] 危机等级柱状图。
- [x] 咨询师工作量柱状图。
- [x] 统一空状态、加载状态、错误提示。
- [x] 前端构建检查。
- [ ] 整理页面截图用于小组报告和答辩 PPT。

---

## 风险与注意事项

1. Session 鉴权要求 Axios 开启 `withCredentials`，否则登录后接口仍可能返回未登录。
2. Naive UI 样式需要统一主题，避免页面风格不一致。
3. 多角色菜单和路由权限必须与后端角色编码一致。
4. 高风险学生在学生端不应使用刺激性文案，主要在管理员和工作人员端突出显示。
5. 统计图表需处理无数据情况，避免图表空白。
6. 文件下载接口必须按 blob 处理，不能按普通 JSON 请求处理。

---

## 2026-06-07 管理员基础管理页面（阶段1修复）

### 完成内容
- 在管理员菜单中补齐阶段1入口，并将管理员默认落地页调整为 `用户管理`。
- 将用户管理、工作人员管理、咨询室管理、时间段配置、值班管理五个页面改为可交互的 mock 实现。
- 补齐搜索、分页、弹窗、新增/编辑、启停用、批量排班等阶段1要求的基本交互。
- 修复日期/时间选择器值类型不一致问题，统一输出字符串格式。
- 修复 `DutyScheduleView` 中 `NInputNumber` 未导入问题。

### 影响文件
- `src/api/admin.ts`
- `src/constants/menus.ts`
- `src/stores/auth.ts`
- `src/views/admin/*.vue`

### 验证方式
- `npm run build`
- `npm run typecheck`
- 管理员页面手动测试（搜索、分页、弹窗、编辑、状态切换、批量排班）
- Playwright 自测：登录默认落地、用户管理 CRUD/搜索/禁用/重置密码、工作人员管理筛选/新增/编辑、咨询室管理新增/编辑、时间段非法时间校验/新增/编辑、值班新增/停用/批量排班

### 遗留问题
- 值班管理页面当前仍主要依赖前端 mock 数据，尚未切到真实后端接口。
- 管理员预约审核、初访员任务与结果页目前仍以前端 mock 数据流为主。

---

## 2026-06-07 review并修复 ltb 阶段2/3 页面

### 完成内容
- 审查 `ltb-stage2-audit` 与 `ltb-stage3-interviewer` 两个 PR，确认原 PR 存在阶段1改动混入、直接切换真实 API 导致现有 mock 页面失效等问题。
- 在 `dev-qxz` 上补齐共享 mock 初访流程数据，打通“管理员审核 → 初访员任务 → 初访结果提交”的演示链路。
- 完成 `AppointmentAuditView`，支持搜索、风险高亮、详情抽屉、通过/驳回/改约/优先操作与二次确认。
- 完成 `InterviewTaskView` 与 `InterviewResultEditView`，支持任务筛选、结果录入、转介必填校验、已提交结果回显。
- 补齐 `src/api/interviewer.ts` 与相关路由，保证阶段2/3页面可单独访问并通过构建检查。

### 影响文件
- `src/api/admin.ts`
- `src/api/interviewer.ts`
- `src/api/mock-first-visit.ts`
- `src/router/routes.ts`
- `src/views/admin/AppointmentAuditView.vue`
- `src/views/interviewer/InterviewTaskView.vue`
- `src/views/interviewer/InterviewResultEditView.vue`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 基于共享 mock 数据手动走通管理员审核与初访结果录入链路

### 遗留问题
- 当前阶段2/3仍是前端 mock 流程，尚未接入真实后端接口。
- 心理助理咨询队列页面仍为占位页，初访结论为“安排咨询”后尚未在前端展示后续队列页面。

---

## 2026-06-08 review 修正 ltb 阶段3 初访员任务权限

### 完成内容
- 在 `dev-qxz` 上复核 ltb 阶段3后发现，初访任务 mock API 将当前初访员写死为 `staffId=2002`，导致切换到其他初访员账号时仍会看到张老师的任务。
- 将 `pageInterviewTasks`、`getInterviewTaskDetail`、`submitInterviewResult` 改为根据当前登录用户映射到对应 `INTERVIEWER` 工作人员身份，再筛选和校验任务归属。
- 补齐详情页与提交接口的归属校验，避免仅通过改 URL 就查看或提交其他初访员的任务结果。

### 影响文件
- `src/api/admin.ts`
- `src/api/interviewer.ts`

### 验证方式
- `npm run typecheck`
- `npm run build`

### 遗留问题
- 当前阶段3仍基于前端 mock 数据，账号与任务归属校验仅覆盖 mock 演示链路；接入真实后端时仍需以后端接口权限控制为准。

---

## 2026-06-07 合并 lcw 阶段1-3 后 review 修复

### 完成内容
- 将 lcw 的学生端阶段1-3 PR 合入 `dev`，并关闭被阶段3 PR 覆盖的旧阶段 PR。
- 在 `dev-qxz` 上补齐首访登记表到知情同意书的 `formId` 传递，避免依赖临时假数据串联流程。
- 对齐首访登记表与文档约定的字数限制、评分范围和提交提示文案。
- 调整知情同意书页面：未找到登记表时给出明确提示，已签署时可直接继续前往预约页面。
- 在预约页面骨架中展示接收到的 `formId` 状态，便于后续阶段4联调。

### 影响文件
- `src/views/student/FirstVisitFormView.vue`
- `src/views/student/ConsentView.vue`
- `src/views/student/AppointmentCreateView.vue`
- `src/types/student.ts`

### 验证方式
- `npm run typecheck`
- `npm run build`

### 遗留问题
- 学生端阶段4/5仍未实现真实预约列表、通知列表与时段选择逻辑。
- 当时学生端后端接口尚未完成，当前已由 qxz 在后端补齐“首访登记表/知情同意”最小接口，已可支撑阶段2/3链路。

---

## 2026-06-07 收尾 review、修复并合入 `dev`

### 完成内容
- 将 qxz 对 lcw 阶段1-3的 review 修复通过 PR #19 合入 `dev`。
- 将管理员基础管理中的用户管理、工作人员管理、咨询室管理、时间段配置切到真实后端接口，解决“刷新后数据回退”的问题。
- 复核当前已合入 `dev` 的 ltb / lcw 前端内容，确认按各自 PR 宣称的阶段进度可正常演示与继续开发。
- 通过浏览器实测管理员基础管理页面、预约审核页、初访员任务页，以及学生“首访登记表 → 知情同意书 → 初访预约骨架页”链路。

### 影响文件
- `src/api/admin.ts`
- `src/views/student/FirstVisitFormView.vue`
- `src/views/student/ConsentView.vue`
- `src/views/student/AppointmentCreateView.vue`
- `src/views/admin/*.vue`
- `docs/progress.md`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 浏览器实测：管理员登录、用户/工作人员/咨询室/时间段管理、预约审核页、初访员任务页、学生首访登记与知情同意流程

### 遗留问题
- 值班管理、预约审核、初访结果页仍主要使用 mock 数据流。
- 学生“我的预约 / 我的通知 / 可预约时段选择”仍是后续阶段内容，当前未完成真实业务实现。

---

## 2026-06-07 心理助理页面（assignment-zyt 阶段1）

### 完成内容
- 新增心理助理 mock API，基于初访结果生成咨询队列，并保存正式咨询安排状态。
- 完成 `ConsultationQueueView`，支持关键词、危机等级、问题类型、队列状态筛选，支持安排咨询和暂缓。
- 新增 `ConsultationArrangeView`，展示学生信息和初访摘要，支持选择咨询师、咨询日期、时间段、咨询室并生成安排预览。
- 提交安排时进行咨询师/咨询室同日期同时间段冲突校验，冲突原因直接展示在页面提示中。
- 补齐助理菜单、正式咨询安排路由和队列状态标签。

### 影响文件
- `src/api/assistant.ts`
- `src/api/mock-first-visit.ts`
- `src/components/common/StatusTag.vue`
- `src/constants/menus.ts`
- `src/router/routes.ts`
- `src/views/assistant/ConsultationQueueView.vue`
- `src/views/assistant/ConsultationArrangeView.vue`
- `../assignment-zyt.md`

### 验证方式
- 编辑器诊断检查新增/修改文件无 linter 错误。
- 本地终端复跑 `npm run typecheck`、`npm run build`。
- 浏览器手动登录心理助理账号后完成阶段1冒烟：队列展示、关键词筛选、安排页详情展示、安排预览、提交成功、冲突原因展示、暂缓确认与状态变更。

### 遗留问题
- 当前阶段仍为前端 mock 数据，尚未接入真实后端咨询队列和正式咨询安排接口。
- 后续等待 PR review 后合入 `dev`。

---

## 2026-06-07 咨询师页面（assignment-zyt 阶段2）

### 完成内容
- 新增咨询师 mock API，支撑我的日程、咨询记录、追加申请、结案报告和 Word 下载触发。
- 完成 `MyScheduleView`，支持日期范围、状态、学生关键词筛选，并展示学生、日期、时间段、地点、第几次和状态。
- 新增 `ConsultationRecordEditView`，展示日程信息和学生信息，支持保存咨询状态、咨询时间、咨询摘要和后续计划。
- 新增 `ExtensionRequestView`，支持新增追加咨询申请，并校验申请原因必填且不少于 10 字。
- 新增 `CaseReportEditView`，支持保存草稿、二次确认后提交报告，以及触发 Word 下载提示。
- 补齐咨询师菜单、路由和正式咨询相关状态标签。

### 影响文件
- `src/api/counselor.ts`
- `src/components/common/StatusTag.vue`
- `src/constants/menus.ts`
- `src/router/routes.ts`
- `src/views/counselor/*.vue`
- `../assignment-zyt.md`

### 验证方式
- 编辑器诊断检查新增/修改文件无 linter 错误。
- 待提交前复跑 `npm run typecheck`、`npm run build`。

### 遗留问题
- 当前阶段仍为前端 mock 数据，尚未接入真实后端咨询师接口。
- 提交、推送和 PR 需在确认后按 `git-work.md` 执行。

---

## 2026-06-08 review 修正 zyt 阶段1/2

### 完成内容
- 在 `dev-qxz` 上同步 zyt 的心理助理与咨询师阶段页面到最新 `dev` 基线，准备统一 review 与验收。
- 修复 `ConsultationArrangeView`：支持从菜单直达后手动选择队列记录，不再只能从队列表跳转进入。
- 修复咨询安排页在同页切换不同队列记录时表单、详情和安排预览残留上一条记录数据的问题。 
- 修复结案报告列表中“直接提交草稿”会绕过必填与最小字数校验的问题。

### 影响文件
- `src/api/assistant.ts`
- `src/views/assistant/ConsultationArrangeView.vue`
- `src/views/counselor/CaseReportEditView.vue`

### 验证方式
- `npm run typecheck`
- `npm run build`

### 遗留问题
- 当前阶段仍以前端 mock 数据演示为主，未接入真实助理/咨询师后端接口。
- 待用户验收通过后，再按协作规范提交、推送并创建 PR。

---

## 2026-06-08 review 修正 zyt 阶段3统计与日志页面

### 完成内容
- 先将 zyt 的前端 PR #23 合入远端 `dev`，再将本地 `dev-qxz` 同步到最新 `origin/dev` 基线后继续 review。
- 将统计看板、通知日志、操作日志 3 个页面的筛选区改为 `Naive UI` 表单控件，和现有管理员页面交互风格保持一致。
- 修复统计看板在“筛到无数据后再次恢复有数据”场景下，ECharts 实例可能仍绑定旧 DOM 的稳定性问题。
- 将统计页 ECharts 从全量引入改为按需引入，显著降低 `StatisticsView` 构建产物体积。

### 影响文件
- `src/views/admin/StatisticsView.vue`
- `src/views/admin/NotificationLogView.vue`
- `src/views/admin/OperationLogView.vue`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 构建后 `StatisticsView` chunk 由约 `1068 kB` 降至约 `549 kB`

### 遗留问题
- 当前统计与日志数据仍为 mock 数据，后续需等待后端阶段6/7接口联调替换。
- 当前通过 `chunkSizeWarningLimit` 对齐项目依赖规模；如后续继续扩展统计页，可再拆分公共图表逻辑或做更细粒度按需加载。

---

## 2026-06-08 review 修正 lcw 阶段4/5 学生页面

### 完成内容
- 在 `dev-qxz` 上同步 lcw 学生端“我的预约 / 我的通知”页面到最新 `dev` 基线并完成 review。
- 修复我的预约页“新建预约”跳转到不存在路由 `/student/appointments/create` 的问题，改为正确跳转 `/student/appointment-create`。
- 修复我的通知页筛选控件未透传 `notifyType` 参数，导致筛选 UI 存在但请求始终返回全量数据的问题。
- 补齐通知类型映射，兼容预约驳回、预约撤销和系统通知等已有后端类型。

### 影响文件
- `src/views/student/MyAppointmentsView.vue`
- `src/views/student/MyNotificationsView.vue`
- `src/api/student.ts`
- `docs/progress.md`

### 验证方式
- `npm run typecheck`
- `npm run build`

### 遗留问题
- 学生端“我的预约 / 我的通知”已接入真实接口，但仍需后续联调更多真实通知产生场景。
- 构建仍提示 `StatisticsView` chunk 超过 `500 kB` 警戒线，本次未继续处理该非阻塞告警。

---

## 2026-06-08 阶段三：统计看板与日志页面

### 完成内容
- 新增 `StatisticsView.vue`：日期范围、咨询师、问题类型筛选；6 个顶部指标卡；月度趋势折线图、问题类型饼图、危机等级柱状图、咨询师工作量柱状图；无数据空状态；页面卸载时释放 ECharts 实例。
- 新增 `NotificationLogView.vue`：关键词、通知类型、发送状态、时间范围筛选与分页表格。
- 新增 `OperationLogView.vue`：操作人、模块、操作类型、结果状态、时间范围筛选与分页表格。
- 新增 mock API：`src/api/statistics.ts`、`src/api/logs.ts`。
- 管理员菜单与路由接入统计看板、通知日志、操作日志。

### 影响文件
- `src/api/statistics.ts`
- `src/api/logs.ts`
- `src/views/admin/StatisticsView.vue`
- `src/views/admin/NotificationLogView.vue`
- `src/views/admin/OperationLogView.vue`
- `src/router/routes.ts`
- `src/constants/menus.ts`
- `docs/progress.md`

### 验证方式
- `npm run typecheck`
- 管理员账号登录后访问 `/admin/statistics`、`/admin/logs/notifications`、`/admin/logs/operations`

### 遗留问题
- 统计数据与日志接口仍为前端 mock，待阶段 6/7 与后端联调。

---

## 2026-06-08 阶段三：初访员任务与结果页面（assignment-ltb）

### 完成内容
- 完善 `InterviewTaskView.vue`：支持日期范围、状态、风险等级筛选；表格展示预约编号、学生姓名、学号、预约日期、时间段、地点、风险等级、状态；支持分页功能；状态为 APPROVED 时显示"录入结果"按钮，COMPLETED 时显示"查看结果"按钮。
- 完善 `InterviewResultEditView.vue`：展示学生信息卡片（预约编号、状态、姓名、学号、院系、电话、预约时间、地点、风险等级、优先标记）；展示首访登记摘要（主要困扰、期望帮助、问题描述、风险评分、情绪/睡眠/压力评分、自伤倾向、紧急求助）；表单包含危机等级、问题类型、初访时间、初访结论、初访摘要、后续建议；转介送诊时后续建议必填；提交前二次确认；紧急风险时显示特殊提示；已提交结果以只读模式展示。
- 补充 3 条演示数据（interviewerId=2002，状态为 APPROVED），支持分页功能测试和结果录入演示。

### 影响文件
- `src/views/interviewer/InterviewTaskView.vue`
- `src/views/interviewer/InterviewResultEditView.vue`
- `src/api/interviewer.ts`
- `src/api/mock-first-visit.ts`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 初访员账号登录后访问 `/interviewer/tasks`
- 测试任务列表筛选、分页功能
- 测试结果录入、转介必填校验、二次确认功能
- 测试已提交结果的只读展示

### 遗留问题
- 当前阶段仍为前端 mock 数据，尚未接入真实后端接口。

---

## 后续更新规则

## 2026-06-06 前端最小骨架

### 完成内容
- 初始化 Vite + Vue 3 + TypeScript 工程。
- 安装并接入 `vue-router`、`naive-ui`、`axios`、`echarts`、`dayjs`。
- 创建 `AuthLayout`、`MainLayout`、`BlankLayout`。
- 创建 `AppSidebar`、`AppHeader`、`PageHeader`、`StatusTag`、`RiskTag`。
- 创建登录页、工作台、403/404 页面和五类角色关键空路由。
- 配置 Vite 代理到 `http://127.0.0.1:24681`。

### 影响文件
- `package.json`
- `vite.config.ts`
- `src/`

### 验证方式
- `npm install`
- `npm run build`
- `npm run typecheck`
- 前端 dev server 通过 `http://127.0.0.1:24680/api/health` 成功代理后端接口

### 遗留问题
- 仅完成骨架和关键空页面，学生端、管理员端、初访员端、助理端、咨询师端的业务页面仍待继续实现。

每完成一个页面或公共组件，应在本文件追加记录：

```text
## YYYY-MM-DD 功能名称

### 完成内容
- ...

### 影响文件
- ...

### 验证方式
- npm run build
- 页面手动测试
- 接口联调结果

### 遗留问题
- ...

## 2026-06-08 学生端初访预约页面（阶段4）

### 完成内容
- 实现初访预约页面 `AppointmentCreateView.vue`，支持完整的预约流程。
- 添加预约说明卡片，说明预约审核和撤销规则。
- 实现日期选择器，禁止选择过去日期。
- 实现可预约时间段列表，展示初访员姓名、时间段、咨询室、剩余容量。
- 不可用时间段置灰并显示不可用原因。
- 选择时间段后显示预约预览，包括初访员、日期、时间段、咨询室。
- 实现提交预约功能，调用 `createFirstVisitAppointment` 接口。
- 处理后端 409 冲突提示，显示错误信息。
- 提交成功后自动跳转到“我的预约”页面。

### 影响文件
- `src/views/student/AppointmentCreateView.vue`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 页面手动测试：选择日期、选择时间段、提交预约、错误提示
- 测试 409 冲突提示（需后端支持或 mock）

### 遗留问题
- 当前使用 mock 数据，后端接口尚未完全实现。
- 需要与后端联调确认预约容量校验和冲突处理逻辑。

## 2026-06-08 学生端初访预约后端接口（阶段4补充）

### 完成内容
- 实现学生预约控制器 `StudentAppointmentController`，添加 `POST /api/student/appointments` 接口。
- 创建 `FirstVisitAppointment` 实体类，映射 `first_visit_appointment` 表。
- 创建 `AppointmentCreateRequest` DTO 类，定义预约创建请求参数。
- 创建 `StudentAppointmentMapper` 接口，实现预约记录插入和查询。
- 创建 `StudentAppointmentService` 服务类，实现预约创建逻辑，包括：
  - 验证学生是否有未完成的预约（防止重复预约）
  - 生成预约编号
  - 创建预约记录
  - 返回预约结果

### 影响文件
- `src/main/java/com/tyut/psychological/student/entity/FirstVisitAppointment.java`
- `src/main/java/com/tyut/psychological/student/dto/AppointmentCreateRequest.java`
- `src/main/java/com/tyut/psychological/student/mapper/StudentAppointmentMapper.java`
- `src/main/java/com/tyut/psychological/student/service/StudentAppointmentService.java`
- `src/main/java/com/tyut/psychological/student/controller/StudentAppointmentController.java`

### 验证方式
- `mvnw.cmd compile`
- 启动后端服务
- 使用 Postman 或前端页面测试 `POST /api/student/appointments` 接口
- 测试重复预约拦截（应返回 409 错误）
- 测试正常预约流程

### 遗留问题
- 当前预约创建逻辑简化，未实现完整的值班安排校验和容量更新。
- 需要与前端联调确认预约参数传递和错误处理。

---

## 2026-06-08 学生端预约与通知页面（阶段二补充）

### 完成内容

- 实现学生端"我的预约页面" `MyAppointmentsView.vue`，支持预约列表展示、状态筛选、分页、撤销预约功能。
- 实现学生端"我的通知页面" `MyNotificationsView.vue`，支持通知列表展示、类型筛选、分页功能。
- 两个页面均使用远程分页，调用后端真实接口。
- 预约页面支持按状态（待审核、已通过、已驳回、已撤销、已完成）筛选。
- 通知页面支持按类型（预约审核通过、预约改约通知、咨询安排通知、咨询取消通知）筛选。

### 影响文件

- `src/views/student/MyAppointmentsView.vue`
- `src/views/student/MyNotificationsView.vue`

### 验证方式

- `npm run typecheck`
- `npm run build`
- 学生账号登录后访问"我的预约"和"我的通知"页面

### 遗留问题

- 可预约时间段选择组件已集成在 `AppointmentCreateView.vue` 中，暂无需单独抽取。

---

## 2026-06-08 阶段五：值班管理与预约审核接入真实后端接口

### 完成内容
- 将 `DutyScheduleView.vue` 的值班列表查询、新增、编辑、批量排班从 mock 数据切换到真实后端接口
- 将工作人员选项、咨询室选项、时间段选项从 mock 切换到真实接口
- 将 `AppointmentAuditView.vue` 的值班选项下拉框从 mock 数据切换到真实后端接口
- 保持预约审核的通过/驳回/改约/优先操作使用真实 API
- 新增真实 API 函数：`pageDutySchedulesReal`、`createDutyScheduleReal`、`updateDutyScheduleReal`、`batchCreateDutySchedulesReal`、`getStaffOptionsReal`、`getRoomOptionsReal`、`getTimeSlotOptionsReal`、`getInterviewDutyOptionsReal`

### 影响文件
- `src/api/admin.ts`
- `src/views/admin/DutyScheduleView.vue`
- `src/views/admin/AppointmentAuditView.vue`

### 验证方式
- `npm run typecheck`
- `npm run build`
- 管理员登录后测试值班管理页面：分页、筛选、新增、编辑、停用/启用、批量排班、冲突检测
- 管理员登录后测试预约审核页面：列表显示、筛选、详情查看、通过、驳回、改约、优先标记
- 验证值班选项下拉框显示真实数据

### 已知问题
- 高风险行红色高亮背景与操作按钮区域有轻微视觉重叠（鼠标悬停时消失），暂不影响功能使用

### review 修正
- 将批量排班的“周日”选项从 mock 时代的 `0` 改为与后端 `DayOfWeek` 一致的 `7`，修复接入真实接口后选择周日却不会生成值班的问题。
- 补齐批量排班成功提示中的 `skippedCount/conflicts` 反馈，避免真实接口跳过冲突记录时前端仍误报“全部创建成功”。

### 遗留问题
- 阶段六（后端初访员接口）和阶段七（前后端联调）仍待完成

---

## 2026-06-10 qxz 整体 review 修复：构建与文档收口

### 完成内容

- 清理前端源码中的生产调试输出，统一改为页面提示或静默回退。
- 为 Vite 构建设置合理的 `chunkSizeWarningLimit`，消除统计页在当前依赖规模下的无效体积告警。
- 更新顶部当前状态，明确学生端、管理员值班/审核已接入真实接口，初访员/助理/咨询师/统计/日志仍有 mock 到真实接口的联调债务。
- 更新 `docs/api.md` 中统计与日志接口路径，和当前后端 Controller 保持一致。

### 影响文件

- `vite.config.ts`
- `src/views/auth/LoginView.vue`
- `src/views/student/FirstVisitFormView.vue`
- `src/views/student/ConsentView.vue`
- `src/components/student/AvailableSlotsSelector.vue`
- `docs/api.md`
- `docs/progress.md`

### 验证方式

- `npm run typecheck`
- `npm run build`

### 遗留问题

- `src/api/statistics.ts`、`src/api/logs.ts`、`src/api/counselor.ts`、`src/api/assistant.ts` 等后半段 API 模块仍存在 mock 实现，下一轮应按后端真实接口逐页切换并联调。

---

## 2026-06-10 qxz 补齐管理员结案报告管理页面

### 完成内容

- 新增 `CaseReportManageView.vue`，支持管理员按学生关键词、咨询师、问题类型、结案类型、提交日期范围筛选已提交结案报告。
- 补齐管理员结案报告列表、详情抽屉和 Word 下载操作，并接入现有后端 `/admin/case-reports`、`/admin/case-reports/{id}`、`/admin/case-reports/{id}/export-word` 接口。
- 在前端路由和管理员菜单中补上“结案报告管理”入口，消除管理员端最后一个缺失页面。
- 为匹配页面展示，后端结案报告查询补充返回 `counselorName` / `counselorId`，并新增 XML 回归测试防止关联关系回退。

### 影响文件

- `src/views/admin/CaseReportManageView.vue`
- `src/api/admin.ts`
- `src/router/routes.ts`
- `src/constants/menus.ts`
- `docs/progress.md`
- `../backend/src/main/java/com/tyut/psychological/report/vo/CaseReportVO.java`
- `../backend/src/main/resources/mapper/report/CaseReportMapper.xml`
- `../backend/src/test/java/com/tyut/psychological/report/mapper/CaseReportMapperXmlTest.java`

### 验证方式

- `npm run typecheck`
- `npm run build`
- `./mvnw test`

### 遗留问题

- 管理员端当前已支持单个 Word 下载，文档中提到的批量下载仍可作为可选增强项后续再补。

---

## 2026-06-10 qxz review 修复：阶段7真实接口联调回归

### 完成内容

- 复核 zyt 将助理/咨询师/统计/日志切到真实接口后的页面行为，修复统计页首次进入默认不传日期范围、直接触发后端 400 的问题，改为默认查询当月数据。
- 修复助理咨询队列状态枚举不一致问题，将前端 `DEFERRED` 改为与后端一致的 `SUSPENDED`，同步更新筛选项与状态标签展示。
- 修复通知日志与操作日志时间筛选参数格式，改为发送整日边界的 `yyyy-MM-dd HH:mm:ss`，避免后端 `LocalDateTime` 参数解析失败。
- 为操作日志页面补回真实 `moduleName` 查询参数透传，并补齐通知类型选项，避免界面展示可选但请求未生效。

### 影响文件

- `src/api/assistant.ts`
- `src/api/logs.ts`
- `src/components/common/StatusTag.vue`
- `src/views/assistant/ConsultationQueueView.vue`
- `src/views/admin/StatisticsView.vue`
- `src/views/admin/NotificationLogView.vue`
- `src/views/admin/OperationLogView.vue`
- `docs/progress.md`

### 验证方式

- `npm run typecheck`
- `npm run build`

### 遗留问题

- 统计页当前已接入真实接口，但仍只展示 4 个总览指标和 4 组图表；若后续需要完全对齐后端已提供的全部统计端点，可继续扩展页面内容。

