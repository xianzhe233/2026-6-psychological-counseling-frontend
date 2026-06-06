# 前端页面实现清单

> 本文档按页面描述具体实现内容，包括路由、角色、组件、表单字段、表格列、操作按钮、接口和校验规则。开发时可直接按本文件拆分任务。

---

## 1. 公共页面

### 1.1 登录页 LoginView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/login` |
| 文件 | `src/views/auth/LoginView.vue` |
| 布局 | `AuthLayout.vue` |
| 角色 | 匿名 |
| 接口 | `POST /api/auth/login`、`GET /api/auth/current` |

页面结构：

1. 左侧项目介绍卡片：系统名称、功能关键词、柔和背景插画或渐变。
2. 右侧登录卡片：用户名、密码、登录按钮。
3. 底部显示课程设计或小组信息。

表单字段：

| 字段 | 组件 | 校验 |
|:--:|:--:|:--|
| username | `n-input` | 必填，2-50 字符 |
| password | `n-input type=password` | 必填，6-32 字符 |

交互：

1. 点击登录后调用 `login()`。
2. 登录成功后调用 `getCurrentUser()` 或直接使用登录返回数据写入 authState。
3. 根据角色跳转：
   - STUDENT → `/student/appointments` 或 `/dashboard`
   - ADMIN → `/admin/appointments/audit`
   - INTERVIEWER → `/interviewer/tasks`
   - ASSISTANT → `/assistant/queue`
   - COUNSELOR → `/counselor/schedules`
4. 登录失败时展示后端错误信息。

### 1.2 工作台 DashboardView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/dashboard` |
| 文件 | `src/views/dashboard/DashboardView.vue` |
| 角色 | 全部登录用户 |
| 接口 | `GET /api/auth/current`，可选统计摘要接口 |

页面内容：

- 欢迎语：显示当前姓名和角色。
- 快捷入口：根据角色展示常用功能卡片。
- 提示信息：学生显示预约流程提示；管理员显示待审核数量；咨询师显示今日咨询数量。

---

## 2. 学生端页面

### 2.1 首访登记表 FirstVisitFormView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/student/first-visit-form` |
| 文件 | `src/views/student/FirstVisitFormView.vue` |
| 角色 | STUDENT |
| 接口 | `GET /student/first-visit/forms/latest`、`POST /student/first-visit/forms` |

页面结构：

1. `PageHeader`：标题“首访登记表”，说明“请如实填写，信息仅用于心理咨询服务”。
2. `n-card`：基本信息区，可从当前学生档案自动带出姓名、学号、学院、电话。
3. `n-card`：主要困扰区。
4. `n-card`：风险问题区。
5. 底部操作：保存/提交按钮。

表单字段：

| 字段 | 组件 | 校验 | 说明 |
|:--:|:--:|:--|:--|
| mainProblem | `n-select` 或 `n-input` | 必填 | 主要困扰，可从问题类型中选择，也允许补充 |
| problemDescription | `n-input type=textarea` | 0-1000 字 | 问题详细描述 |
| expectedHelp | `n-input type=textarea` | 0-500 字 | 希望获得的帮助 |
| moodScore | `n-slider` + `n-input-number` | 必填，0-10 | 情绪困扰程度，越高越严重 |
| sleepScore | `n-slider` + `n-input-number` | 必填，0-10 | 睡眠困扰程度 |
| stressScore | `n-slider` + `n-input-number` | 必填，0-10 | 压力程度 |
| selfHarmFlag | `n-radio-group` | 必填 | 是否存在自伤/伤人想法 |
| emergencyFlag | `n-radio-group` | 必填 | 是否需要紧急帮助 |

提交成功后：

- 若后端返回 `riskLevel`，页面显示“登记表已提交”。
- 跳转到 `/student/consent?formId=xxx`。
- 不在学生端突出显示“高危”等刺激性文案，只提醒保持联系方式畅通。

### 2.2 知情同意书 ConsentView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/student/consent` |
| 文件 | `src/views/student/ConsentView.vue` |
| 角色 | STUDENT |
| 接口 | `GET /student/consents/status`、`POST /student/consents/sign` |

页面结构：

1. 标题：心理咨询知情同意书。
2. 文本卡片：说明咨询服务性质、隐私保护、例外情况、预约规则。
3. 勾选框：我已阅读并同意。
4. 按钮：确认签署并预约。

校验：未勾选时按钮禁用或提示。

签署成功后跳转 `/student/appointment-create?formId=xxx`。

### 2.3 初访预约 AppointmentCreateView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/student/appointment-create` |
| 文件 | `src/views/student/AppointmentCreateView.vue` |
| 角色 | STUDENT |
| 接口 | `GET /student/appointments/available-slots`、`POST /student/appointments` |

页面结构：

1. 预约说明卡片：说明预约审核、撤销规则。
2. 日期选择器：选择预约日期，不允许选择今天以前。
3. 可预约时间段列表：使用 `AppointmentSlotPicker`。
4. 已选预约信息预览。
5. 提交预约按钮。

时间段卡片显示：

- 初访员姓名。
- 时间段名称和具体时间。
- 咨询室。
- 剩余容量。
- 不可用原因。

提交前校验：

1. 必须存在已提交登记表。
2. 必须签署知情同意。
3. 必须选择可用时间段。

提交成功后跳转 `/student/appointments`。

### 2.4 我的预约 MyAppointmentsView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/student/appointments` |
| 文件 | `src/views/student/MyAppointmentsView.vue` |
| 角色 | STUDENT |
| 接口 | `GET /student/appointments`、`POST /student/appointments/{id}/cancel` |

搜索项：

| 字段 | 组件 |
|:--:|:--:|
| appointmentStatus | `n-select` |
| startDate/endDate | `n-date-picker type=daterange` |

表格列：

| 列 | 字段 | 展示 |
|:--:|:--:|:--|
| 预约编号 | appointmentNo | 文本 |
| 预约日期 | appointmentDate | 日期 |
| 时间段 | slotName/startTime/endTime | 拼接显示 |
| 初访员 | interviewerName | 无则显示“待分配” |
| 地点 | roomName | 无则显示“-” |
| 状态 | appointmentStatus | `StatusTag` |
| 审核备注 | auditRemark | tooltip |
| 提交时间 | createTime | 日期时间 |
| 操作 | - | 查看、撤销 |

撤销规则：

- `cancelable=true` 显示撤销按钮。
- 点击撤销弹出原因输入框。
- 提交成功后刷新列表。

### 2.5 我的通知 MyNotificationsView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/student/notifications` |
| 文件 | `src/views/student/MyNotificationsView.vue` |
| 角色 | STUDENT |
| 接口 | `GET /student/notifications` |

表格列：通知类型、标题、内容、发送状态、发送时间。

---

## 3. 管理员端页面

### 3.1 用户管理 UserManageView

| 项目 | 内容 |
|:--:|:--|
| 路由 | `/admin/users` |
| 文件 | `src/views/admin/UserManageView.vue` |
| 角色 | ADMIN |
| 接口 | 用户管理相关接口 |

搜索项：关键词、角色、状态。

表格列：用户名、姓名、手机号、角色、状态、最后登录时间、创建时间、操作。

操作：新增、编辑、启用、禁用、重置密码。

弹窗表单字段：用户名、姓名、手机号、邮箱、角色、多选、状态、初始密码。

### 3.2 工作人员管理 StaffManageView

搜索项：关键词、工作人员类型、状态。

表格列：工号、姓名、手机号、类型、职称、擅长方向、每日容量、状态、操作。

弹窗字段：姓名、手机号、工号、类型、职称、擅长方向、简介、每日最大预约量、状态。

工作人员类型：管理员、初访员、心理助理、咨询师。

### 3.3 咨询室管理 RoomManageView

表格列：咨询室名称、地点、容量、状态、备注、操作。

弹窗字段：咨询室名称、地点、容量、状态、备注。

### 3.4 时间段配置 TimeSlotManageView

表格列：时间段名称、开始时间、结束时间、间隔分钟、状态、操作。

弹窗字段：时间段名称、开始时间、结束时间、间隔分钟、状态。

校验：结束时间必须晚于开始时间。

### 3.5 值班管理 DutyScheduleView

搜索项：工作人员类型、工作人员、日期范围、状态。

表格列：日期、时间段、工作人员、类型、地点、容量、已预约数、剩余数、状态、操作。

操作：新增、编辑、停用、批量排班。

新增表单字段：

- staffType：初访员/咨询师。
- staffId：根据类型加载人员下拉。
- dutyDate：日期。
- slotId：时间段。
- roomId：咨询室。
- capacity：容量。
- status：启用/停用。

批量排班：

- dateRange：日期范围。
- weekdays：周几多选。
- staffId。
- slotIds：时间段多选。
- roomId。
- capacity。

冲突处理：后端返回 409 时，弹窗展示冲突原因。

### 3.6 初访预约审核 AppointmentAuditView

搜索项：关键词、状态、风险等级、优先标记、日期范围。

表格列：

| 列 | 字段 | 展示 |
|:--:|:--:|:--|
| 预约编号 | appointmentNo | 文本 |
| 学号 | studentNo | 文本 |
| 姓名 | studentName | 文本 |
| 院系 | college | 文本 |
| 主要困扰 | mainProblem | tooltip |
| 风险等级 | riskLevel | `RiskTag` |
| 预约时间 | appointmentDate + slotName | 文本 |
| 初访员 | interviewerName | 文本 |
| 状态 | appointmentStatus | `StatusTag` |
| 优先 | priorityFlag | 标签 |
| 操作 | - | 查看、通过、驳回、改约、优先 |

高风险行：

- `riskLevel=HIGH`：浅红背景。
- `riskLevel=URGENT`：浅红背景 + 紧急标签。

审核详情抽屉：

- 学生基础信息。
- 首访登记摘要。
- 风险评分明细。
- 预约信息。
- 审核历史/通知记录。

通过弹窗字段：初访员、日期、时间段、咨询室、审核备注。

驳回弹窗字段：驳回原因，必填。

改约弹窗字段：新初访员、新日期、新时间段、新咨询室、备注。

### 3.7 统计看板 StatisticsView

页面结构：

1. 顶部筛选：日期范围、咨询师、问题类型。
2. 指标卡片：待审核预约数、高风险学生数、排队人数、已安排咨询数、结案数。
3. 图表区：
   - 月度初访预约趋势折线图。
   - 问题类型分布饼图。
   - 危机等级分布柱状图。
   - 咨询师工作量柱状图。
4. 导出按钮：导出统计 Excel（后端支持后实现）。

图表组件需要在页面卸载时释放 ECharts 实例。

### 3.8 结案报告管理 CaseReportManageView

搜索项：学生关键词、咨询师、问题类型、结案类型、日期范围。

表格列：报告编号/ID、学生姓名、学号、咨询师、问题类型、咨询总次数、结案类型、报告状态、提交时间、操作。

操作：查看详情、下载 Word、批量下载（可选）。

### 3.9 通知日志 NotificationLogView

搜索项：关键词、通知类型、发送状态、时间范围。

表格列：接收人、手机号、通知类型、标题、内容、发送状态、发送时间。

### 3.10 操作日志 OperationLogView

搜索项：操作人、模块、操作类型、结果状态、时间范围。

表格列：操作人、角色、模块、操作类型、描述、结果、耗时、IP、时间。

---

## 4. 初访员端页面

### 4.1 我的初访任务 InterviewTaskView

搜索项：日期范围、状态、风险等级。

表格列：预约编号、学生姓名、学号、预约日期、时间段、地点、风险等级、状态、操作。

操作：查看详情、录入结果。

### 4.2 初访结果录入 InterviewResultEditView

页面结构：

1. 学生信息卡片。
2. 首访登记摘要。
3. 初访结果表单。

表单字段：

| 字段 | 组件 | 校验 |
|:--:|:--:|:--|
| crisisLevel | `n-select` | 必填 |
| problemTypeId | `n-tree-select` 或 `n-select` | 必填 |
| interviewTime | `n-date-picker type=datetime` | 必填 |
| conclusion | `n-radio-group` | 必填 |
| summary | `n-input type=textarea` | 建议填写 |
| nextAction | `n-input type=textarea` | 转介时必填 |

提交成功后返回任务列表。

---

## 5. 心理助理端页面

### 5.1 咨询队列 ConsultationQueueView

搜索项：关键词、危机等级、问题类型、队列状态。

表格列：学生姓名、学号、问题类型、危机等级、优先级分数、入队时间、队列状态、操作。

操作：查看详情、安排咨询、暂缓。

行排序：后端已按优先级排序，前端展示即可。

### 5.2 咨询安排 ConsultationArrangeView

两种进入方式：

1. 从队列页点击“安排咨询”，带入 `queueId`。
2. 从菜单进入，手动选择队列记录。

页面结构：

1. 学生和初访结果摘要。
2. 咨询师选择。
3. 起始日期选择。
4. 时间段选择。
5. 咨询室选择。
6. 安排说明。
7. 当前咨询安排预览。
8. 提交安排按钮。

预览表列：次数、日期、星期、时间段、咨询师、咨询室、状态/冲突原因。

提交后：

- 成功：显示“正式咨询安排已生成”。
- 冲突：展示冲突列表，不关闭弹窗。

---

## 6. 咨询师端页面

### 6.1 我的咨询日程 MyScheduleView

搜索项：日期范围、状态、学生关键词。

表格列：日期、时间段、学生姓名、问题类型、第几次、地点、状态、操作。

操作：查看详情、录入记录、填写结案报告。

### 6.2 咨询记录录入 ConsultationRecordEditView

页面结构：

1. 日程信息卡片。
2. 学生基本信息。
3. 咨询记录表单。

字段：

| 字段 | 组件 | 校验 |
|:--:|:--:|:--|
| recordStatus | `n-select` | 必填 |
| consultationTime | `n-date-picker type=datetime` | 必填 |
| contentSummary | `n-input type=textarea` | 完成咨询时建议填写 |
| nextPlan | `n-input type=textarea` | 可选 |
| needClose | `n-switch` | 可选 |

若 `recordStatus=CLOSED` 或 `needClose=1`，提示可前往结案报告页面。

### 6.3 追加咨询申请 ExtensionRequestView

表格列：学生姓名、申请次数、申请原因、状态、审核备注、提交时间。

新增表单：学生、追加次数、申请原因。

校验：追加次数大于 0，申请原因必填且不少于 10 字。

### 6.4 结案报告 CaseReportEditView

列表区域：我的结案报告列表。

编辑区域字段：

| 字段 | 组件 | 校验 |
|:--:|:--:|:--|
| studentId | `n-select` | 必填 |
| problemTypeId | `n-select` | 必填 |
| totalSessions | `n-input-number` | 必填，大于0 |
| effectSelfRating | `n-select` | 必填 |
| closeType | `n-select` | 必填 |
| caseSummary | `n-input type=textarea` | 建议不少于20字 |
| counselingEffect | `n-input type=textarea` | 可选 |
| suggestion | `n-input type=textarea` | 可选 |

操作：保存草稿、提交报告、下载 Word。

提交报告前二次确认：提交后管理员可查看和下载。

---

## 7. 页面开发通用要求

1. 所有列表页必须有 loading、empty、分页。
2. 所有保存按钮必须有 submitting 状态，防止重复提交。
3. 所有删除、驳回、取消、释放、提交报告操作必须二次确认。
4. 所有日期时间显示通过 `utils/date.ts` 格式化。
5. 所有状态显示通过 `StatusTag` 或 `RiskTag`，禁止页面内临时写颜色。
6. 所有接口调用写在 `api/` 模块，页面不直接写 URL。
7. 所有下拉选项优先从统一常量或字典接口获取。
8. 页面完成后同步更新 `docs/progress.md`。
