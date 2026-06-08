# 前端接口调用设计文档

> 本文档描述前端如何封装和调用后端接口。后端接口的最终实现以 `project/backend/docs/api.md` 为准；本文件侧重前端 API 模块划分、请求参数、页面调用关系和错误处理。

---

## 1. 通用约定

### 1.1 基础地址

开发环境建议：

```env
VITE_API_BASE_URL=http://127.0.0.1:24681/api
```

若使用 Vite 代理，也可设置：

```env
VITE_API_BASE_URL=/api
```

并在 `vite.config.ts` 中代理到后端服务。

### 1.2 Axios 实例

`src/api/http.ts`：

```ts
import axios from 'axios'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true
})
```

必须开启 `withCredentials: true`，因为后端使用 Session，浏览器需要携带 `JSESSIONID` Cookie。

### 1.3 统一返回格式

前端按如下格式解析：

```ts
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}
```

列表分页统一格式：

```ts
export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}
```

分页请求统一格式：

```ts
export interface PageQuery {
  pageNum: number
  pageSize: number
}
```

### 1.4 错误处理

| 后端 code / HTTP 状态 | 前端处理 |
|:--:|:--|
| 200 | 返回 `data` |
| 400 | 表单或参数错误，使用 `message.error` 展示 |
| 401 | 清空登录状态，跳转 `/login` |
| 403 | 跳转 `/403` |
| 404 | 资源不存在，页面级显示空状态或跳转 404 |
| 409 | 业务冲突，展示后端 message，例如时间冲突 |
| 500 | 系统异常，展示“系统繁忙，请稍后重试” |

---

## 2. API 模块划分

```text
src/api/
├── http.ts          # Axios 实例、拦截器
├── auth.ts          # 登录、退出、当前用户
├── student.ts       # 学生端首访登记、同意书、预约、通知
├── admin.ts         # 管理端用户、工作人员、时间段、值班、审核、报告
├── interviewer.ts   # 初访员任务和初访结果
├── assistant.ts     # 心理助理咨询队列和咨询安排
├── counselor.ts     # 咨询师日程、记录、追加申请、结案报告
├── statistics.ts    # ECharts 数据接口
└── logs.ts          # 通知日志、操作日志
```

页面组件只能调用 `src/api/*.ts` 中导出的函数，不直接写 URL。

---

## 3. 认证接口 auth.ts

### 3.1 类型定义

```ts
export type RoleCode = 'STUDENT' | 'ADMIN' | 'INTERVIEWER' | 'ASSISTANT' | 'COUNSELOR'

export interface LoginRequest {
  username: string
  password: string
}

export interface CurrentUser {
  id: number
  username: string
  realName: string
  phone?: string
  roles: RoleCode[]
  primaryRole: RoleCode
}
```

### 3.2 API 函数

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `login(data)` | `POST /auth/login` | 用户登录 | LoginView |
| `logout()` | `POST /auth/logout` | 退出登录 | AppHeader |
| `getCurrentUser()` | `GET /auth/current` | 获取当前登录用户 | 路由守卫、刷新页面 |

示例：

```ts
export function login(data: LoginRequest) {
  return http.post<ApiResult<CurrentUser>>('/auth/login', data)
}
```

---

## 4. 学生端接口 student.ts

### 4.1 首访登记

#### 类型定义

```ts
export interface FirstVisitFormRequest {
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: 0 | 1
  emergencyFlag: 0 | 1
}

export interface FirstVisitFormVO {
  id: number
  studentId: number
  mainProblem: string
  problemDescription?: string
  expectedHelp?: string
  moodScore: number
  sleepScore: number
  stressScore: number
  selfHarmFlag: 0 | 1
  emergencyFlag: 0 | 1
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  formStatus: 'DRAFT' | 'SUBMITTED'
  submitTime?: string
}
```

#### API 函数

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getLatestFirstVisitForm()` | `GET /student/first-visit/forms/latest` | 获取学生最新登记表 | FirstVisitFormView |
| `saveFirstVisitForm(data)` | `POST /student/first-visit/forms` | 保存并提交登记表 | FirstVisitFormView |
| `getFirstVisitFormDetail(id)` | `GET /student/first-visit/forms/{id}` | 查看登记表详情 | MyAppointmentsView |

前端处理要求：

- 提交成功后展示风险等级，但文案应温和，例如“系统已记录你的预约信息，老师会尽快处理”。
- 若 `riskLevel` 为 HIGH/URGENT，不在学生端制造紧张提示，只提示“建议保持手机畅通”。

### 4.2 知情同意

```ts
export interface ConsentVO {
  id: number
  formId: number
  consentVersion: string
  signed: 0 | 1
  signTime?: string
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getConsentStatus(formId)` | `GET /student/consents/status?formId=1` | 查询是否已签署 | ConsentView |
| `signConsent(formId)` | `POST /student/consents/sign` | 签署知情同意书 | ConsentView |

请求：

```ts
{ formId: number, consentVersion: 'v1.0' }
```

### 4.3 初访预约

```ts
export interface AvailableSlotQuery {
  date: string
  interviewerId?: number
}

export interface AvailableSlotVO {
  dutyScheduleId: number
  interviewerId: number
  interviewerName: string
  appointmentDate: string
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  roomId?: number
  roomName?: string
  capacity: number
  reservedCount: number
  remaining: number
  available: boolean
  disabledReason?: string
}

export interface CreateAppointmentRequest {
  formId: number
  dutyScheduleId: number
  appointmentDate: string
  slotId: number
  interviewerId?: number
  roomId?: number
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getAvailableFirstVisitSlots(query)` | `GET /student/appointments/available-slots` | 查询可预约初访时段 | AppointmentCreateView |
| `createFirstVisitAppointment(data)` | `POST /student/appointments` | 提交预约申请 | AppointmentCreateView |
| `getMyAppointments(query)` | `GET /student/appointments` | 我的预约列表 | MyAppointmentsView |
| `cancelMyAppointment(id, reason)` | `POST /student/appointments/{id}/cancel` | 撤销预约 | MyAppointmentsView |

我的预约列表项：

```ts
export interface MyAppointmentVO {
  id: number
  appointmentNo: string
  appointmentDate: string
  slotName: string
  startTime: string
  endTime: string
  interviewerName?: string
  roomName?: string
  appointmentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'COMPLETED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  auditRemark?: string
  cancelable: boolean
  createTime: string
}
```

前端处理要求：

- `cancelable=false` 时撤销按钮置灰，并用 tooltip 展示原因。
- `appointmentStatus=REJECTED` 时展示驳回原因。
- `appointmentStatus=APPROVED` 时展示初访员、时间、地点。

### 4.4 学生通知

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getMyNotifications(query)` | `GET /student/notifications` | 查询我的通知 | MyNotificationsView |

通知项：

```ts
export interface NotificationVO {
  id: number
  notifyType: string
  title: string
  content: string
  sendStatus: 'SUCCESS' | 'FAILED'
  sendTime: string
}
```

---

## 5. 管理端接口 admin.ts

### 5.1 用户管理

```ts
export interface UserQuery extends PageQuery {
  keyword?: string
  roleCode?: RoleCode
  status?: 0 | 1
}

export interface UserSaveRequest {
  id?: number
  username: string
  realName: string
  phone?: string
  email?: string
  password?: string
  roleCodes: RoleCode[]
  status: 0 | 1
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageUsers(query)` | `GET /admin/users` | 用户分页 | UserManageView |
| `createUser(data)` | `POST /admin/users` | 新增用户 | UserManageView |
| `updateUser(id, data)` | `PUT /admin/users/{id}` | 修改用户 | UserManageView |
| `disableUser(id)` | `POST /admin/users/{id}/disable` | 禁用用户 | UserManageView |
| `enableUser(id)` | `POST /admin/users/{id}/enable` | 启用用户 | UserManageView |
| `resetPassword(id)` | `POST /admin/users/{id}/reset-password` | 重置密码 | UserManageView |

### 5.2 工作人员管理

```ts
export interface StaffQuery extends PageQuery {
  keyword?: string
  staffType?: 'ADMIN' | 'INTERVIEWER' | 'ASSISTANT' | 'COUNSELOR'
  status?: 0 | 1
}

export interface StaffSaveRequest {
  userId?: number
  username?: string
  realName: string
  phone?: string
  staffNo?: string
  staffType: 'ADMIN' | 'INTERVIEWER' | 'ASSISTANT' | 'COUNSELOR'
  title?: string
  specialty?: string
  introduction?: string
  maxDailyAppointments?: number
  status: 0 | 1
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageStaff(query)` | `GET /admin/staff` | 工作人员分页 | StaffManageView |
| `createStaff(data)` | `POST /admin/staff` | 新增工作人员 | StaffManageView |
| `updateStaff(id, data)` | `PUT /admin/staff/{id}` | 修改工作人员 | StaffManageView |
| `getStaffOptions(type)` | `GET /admin/staff/options` | 下拉选项 | DutyScheduleView、AppointmentAuditView |

### 5.3 咨询室管理

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageRooms(query)` | `GET /admin/rooms` | 咨询室列表 | RoomManageView |
| `createRoom(data)` | `POST /admin/rooms` | 新增咨询室 | RoomManageView |
| `updateRoom(id, data)` | `PUT /admin/rooms/{id}` | 修改咨询室 | RoomManageView |
| `getRoomOptions()` | `GET /admin/rooms/options` | 咨询室下拉 | DutyScheduleView、ConsultationArrangeView |

### 5.4 时间段配置

```ts
export interface TimeSlotSaveRequest {
  slotName: string
  startTime: string
  endTime: string
  intervalMinutes?: number
  status: 0 | 1
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageTimeSlots(query)` | `GET /admin/time-slots` | 时间段分页 | TimeSlotManageView |
| `createTimeSlot(data)` | `POST /admin/time-slots` | 新增时间段 | TimeSlotManageView |
| `updateTimeSlot(id, data)` | `PUT /admin/time-slots/{id}` | 修改时间段 | TimeSlotManageView |
| `getTimeSlotOptions()` | `GET /admin/time-slots/options` | 时间段下拉 | DutyScheduleView 等 |

### 5.5 值班管理

```ts
export interface DutyScheduleQuery extends PageQuery {
  staffType?: 'INTERVIEWER' | 'COUNSELOR'
  staffId?: number
  startDate?: string
  endDate?: string
  status?: 0 | 1
}

export interface DutyScheduleSaveRequest {
  staffId: number
  staffType: 'INTERVIEWER' | 'COUNSELOR'
  dutyDate: string
  slotId: number
  roomId?: number
  capacity: number
  status: 0 | 1
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageDutySchedules(query)` | `GET /admin/duty-schedules` | 值班分页 | DutyScheduleView |
| `createDutySchedule(data)` | `POST /admin/duty-schedules` | 新增值班 | DutyScheduleView |
| `updateDutySchedule(id, data)` | `PUT /admin/duty-schedules/{id}` | 修改值班 | DutyScheduleView |
| `deleteDutySchedule(id)` | `DELETE /admin/duty-schedules/{id}` | 删除/停用值班 | DutyScheduleView |
| `batchCreateDutySchedules(data)` | `POST /admin/duty-schedules/batch` | 批量排班 | DutyScheduleView |

冲突时后端返回 409，前端显示后端 message。

### 5.6 初访预约审核

```ts
export interface AppointmentAuditQuery extends PageQuery {
  keyword?: string
  status?: string
  riskLevel?: string
  startDate?: string
  endDate?: string
  priorityFlag?: 0 | 1
}

export interface AppointmentAuditVO {
  id: number
  appointmentNo: string
  studentNo: string
  studentName: string
  college?: string
  phone?: string
  mainProblem: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  appointmentDate: string
  slotName: string
  interviewerName?: string
  roomName?: string
  appointmentStatus: string
  priorityFlag: 0 | 1
  createTime: string
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageAuditAppointments(query)` | `GET /admin/first-visit/appointments` | 审核列表 | AppointmentAuditView |
| `getAuditAppointmentDetail(id)` | `GET /admin/first-visit/appointments/{id}` | 审核详情 | AppointmentDetailView/Drawer |
| `approveAppointment(id, data)` | `POST /admin/first-visit/appointments/{id}/approve` | 通过预约 | AppointmentAuditView |
| `rejectAppointment(id, data)` | `POST /admin/first-visit/appointments/{id}/reject` | 驳回预约 | AppointmentAuditView |
| `rescheduleAppointment(id, data)` | `POST /admin/first-visit/appointments/{id}/reschedule` | 改约 | AppointmentAuditView |
| `markPriority(id)` | `POST /admin/first-visit/appointments/{id}/priority` | 标记优先 | AppointmentAuditView |

通过请求：

```ts
{
  dutyScheduleId: number,
  interviewerId: number,
  appointmentDate: string,
  slotId: number,
  roomId?: number,
  auditRemark?: string
}
```

驳回请求：

```ts
{ reason: string }
```

前端处理要求：

- HIGH/URGENT 风险行使用浅红背景或风险标签突出。
- `priorityFlag=1` 显示“优先”标签。
- 通过、驳回、改约均使用 Dialog 二次确认。

### 5.7 结案报告管理

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageCaseReports(query)` | `GET /admin/case-reports` | 结案报告分页 | CaseReportManageView |
| `getCaseReportDetail(id)` | `GET /admin/case-reports/{id}` | 报告详情 | CaseReportManageView |
| `downloadCaseReportWord(id)` | `GET /admin/case-reports/{id}/export-word` | 下载 Word | CaseReportManageView |
| `batchDownloadCaseReports(query)` | `GET /admin/case-reports/export-batch` | 批量下载，可选 | CaseReportManageView |

---

## 6. 初访员接口 interviewer.ts

### 6.1 初访任务

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageInterviewTasks(query)` | `GET /interviewer/tasks` | 我的初访任务 | InterviewTaskView |
| `getInterviewTaskDetail(id)` | `GET /interviewer/tasks/{id}` | 任务详情 | InterviewResultEditView |
| `submitInterviewResult(id, data)` | `POST /interviewer/tasks/{id}/result` | 提交初访结果 | InterviewResultEditView |

初访结果请求：

```ts
export interface InterviewResultRequest {
  crisisLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  problemTypeId: number
  interviewTime: string
  conclusion: 'NO_NEED' | 'ARRANGE_CONSULTATION' | 'TRANSFER'
  summary?: string
  nextAction?: string
}
```

前端处理要求：

- 若 `conclusion=TRANSFER`，`nextAction` 必填。
- 若 `crisisLevel=URGENT`，提交前弹出确认提示：“该学生将被标记为紧急，请确认信息准确”。

---

## 7. 心理助理接口 assistant.ts

### 7.1 咨询队列

```ts
export interface ConsultationQueueQuery extends PageQuery {
  keyword?: string
  crisisLevel?: string
  problemTypeId?: number
  status?: 'WAITING' | 'ARRANGED' | 'SUSPENDED' | 'CLOSED'
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageConsultationQueue(query)` | `GET /assistant/consultation/queue` | 咨询队列分页 | ConsultationQueueView |
| `getQueueDetail(id)` | `GET /assistant/consultation/queue/{id}` | 队列详情 | ConsultationQueueView |
| `suspendQueue(id, reason)` | `POST /assistant/consultation/queue/{id}/suspend` | 暂缓安排 | ConsultationQueueView |

### 7.2 咨询安排

```ts
export interface ArrangeConsultationRequest {
  queueId: number
  studentId: number
  counselorId: number
  consultationDate: string
  slotId: number
  roomId?: number
  remark?: string
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getCounselorAvailableSlots(query)` | `GET /assistant/counselors/available-slots` | 咨询师可用时间 | ConsultationArrangeView |
| `arrangeConsultation(data)` | `POST /assistant/consultation/schedules` | 生成正式咨询安排 | ConsultationArrangeView |
| `pageConsultationSchedules(query)` | `GET /assistant/consultation/schedules` | 咨询安排列表 | ConsultationArrangeView |
| `cancelSchedule(id, reason)` | `POST /assistant/consultation/schedules/{id}/cancel` | 取消单次安排 | ConsultationArrangeView |

前端处理要求：

- 安排前预览当前选择的咨询日期、时间段、咨询师和咨询室。
- 后端返回冲突列表时，用表格展示冲突日期、冲突对象和原因。
- 如需后续继续咨询，由心理助理在咨询安排列表中继续新增后续安排。

---

## 8. 咨询师接口 counselor.ts

### 8.1 咨询日程

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageMySchedules(query)` | `GET /counselor/schedules` | 我的咨询日程 | MyScheduleView |
| `getScheduleDetail(id)` | `GET /counselor/schedules/{id}` | 日程详情 | MyScheduleView |

### 8.2 咨询记录

```ts
export interface ConsultationRecordRequest {
  recordStatus: 'COMPLETED' | 'ABSENT' | 'LEAVE' | 'DROPPED' | 'CLOSED'
  consultationTime: string
  contentSummary?: string
  nextPlan?: string
  needClose: 0 | 1
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `getRecordBySchedule(scheduleId)` | `GET /counselor/schedules/{scheduleId}/record` | 查询记录 | ConsultationRecordEditView |
| `saveConsultationRecord(scheduleId, data)` | `POST /counselor/schedules/{scheduleId}/record` | 保存记录 | ConsultationRecordEditView |

### 8.3 追加咨询申请

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageMyExtensionRequests(query)` | `GET /counselor/extension-requests` | 我的追加申请 | ExtensionRequestView |
| `createExtensionRequest(data)` | `POST /counselor/extension-requests` | 新增追加申请 | ExtensionRequestView |

请求：

```ts
{
  studentId: number,
  requestSessions: number,
  reason: string
}
```

### 8.4 结案报告

```ts
export interface CaseReportRequest {
  studentId: number
  problemTypeId: number
  totalSessions: number
  effectSelfRating: string
  caseSummary?: string
  counselingEffect?: string
  suggestion?: string
  closeType: 'NORMAL' | 'DROPPED' | 'TRANSFER'
  reportStatus: 'DRAFT' | 'SUBMITTED'
}
```

| 函数 | 方法与路径 | 说明 | 页面 |
|:--|:--|:--|:--|
| `pageMyCaseReports(query)` | `GET /counselor/case-reports` | 我的结案报告 | CaseReportEditView |
| `getCaseReport(id)` | `GET /counselor/case-reports/{id}` | 报告详情 | CaseReportEditView |
| `saveCaseReport(data)` | `POST /counselor/case-reports` | 保存报告 | CaseReportEditView |
| `updateCaseReport(id, data)` | `PUT /counselor/case-reports/{id}` | 修改报告 | CaseReportEditView |
| `submitCaseReport(id)` | `POST /counselor/case-reports/{id}/submit` | 提交报告 | CaseReportEditView |
| `downloadMyCaseReportWord(id)` | `GET /counselor/case-reports/{id}/export-word` | 下载 Word | CaseReportEditView |

---

## 9. 统计接口 statistics.ts

### 9.1 查询参数

```ts
export interface StatisticsQuery {
  startDate?: string
  endDate?: string
  counselorId?: number
  problemTypeId?: number
}
```

### 9.2 API 函数

| 函数 | 方法与路径 | 图表 | 页面 |
|:--|:--|:--|:--|
| `getOverview(query)` | `GET /admin/statistics/overview` | 顶部指标卡 | StatisticsView |
| `getMonthlyTrend(query)` | `GET /admin/statistics/monthly-trend` | 月度趋势折线图 | StatisticsView |
| `getProblemTypeDistribution(query)` | `GET /admin/statistics/problem-types` | 问题类型饼图 | StatisticsView |
| `getCrisisLevelDistribution(query)` | `GET /admin/statistics/crisis-levels` | 危机等级柱状图 | StatisticsView |
| `getCounselorWorkload(query)` | `GET /admin/statistics/counselor-workload` | 咨询师工作量柱状图 | StatisticsView |
| `exportStatisticsExcel(query)` | `GET /admin/statistics/export-excel` | Excel 导出 | StatisticsView |

### 9.3 数据格式

顶部指标：

```ts
export interface OverviewStatsVO {
  firstVisitAppointmentCount: number
  pendingAppointmentCount: number
  highRiskStudentCount: number
  waitingQueueCount: number
  consultationScheduleCount: number
  closedCaseCount: number
}
```

饼图：

```ts
export interface PieItem {
  name: string
  value: number
}
```

折线图：

```ts
export interface LineChartVO {
  xAxis: string[]
  series: { name: string; data: number[] }[]
}
```

柱状图：

```ts
export interface BarChartVO {
  xAxis: string[]
  series: { name: string; data: number[] }[]
}
```

---

## 10. 日志接口 logs.ts

### 10.1 通知日志

| 函数 | 方法与路径 | 页面 |
|:--|:--|:--|
| `pageNotificationLogs(query)` | `GET /admin/logs/notifications` | NotificationLogView |

查询参数：

```ts
{
  pageNum: number
  pageSize: number
  keyword?: string
  notifyType?: string
  sendStatus?: 'SUCCESS' | 'FAILED'
  startTime?: string
  endTime?: string
}
```

### 10.2 操作日志

| 函数 | 方法与路径 | 页面 |
|:--|:--|:--|
| `pageOperationLogs(query)` | `GET /admin/logs/operations` | OperationLogView |

查询参数：

```ts
{
  pageNum: number
  pageSize: number
  operatorName?: string
  moduleName?: string
  operationType?: string
  resultStatus?: 'SUCCESS' | 'FAILED'
  startTime?: string
  endTime?: string
}
```

---

## 11. 字典与下拉选项接口

为避免页面硬编码过多，以下选项建议通过接口或前端常量维护。

| 数据 | 接口 | 使用页面 |
|:--:|:--|:--|
| 角色列表 | `GET /admin/roles/options` | 用户管理 |
| 问题类型 | `GET /common/problem-types/options` | 首访结果、结案报告、统计筛选 |
| 时间段 | `GET /admin/time-slots/options` | 值班、预约、咨询安排 |
| 咨询室 | `GET /admin/rooms/options` | 值班、咨询安排 |
| 初访员 | `GET /admin/staff/options?staffType=INTERVIEWER` | 值班、审核 |
| 咨询师 | `GET /admin/staff/options?staffType=COUNSELOR` | 值班、咨询安排 |

通用选项类型：

```ts
export interface OptionItem {
  label: string
  value: string | number
  disabled?: boolean
}
```

---

## 12. 页面与接口映射总表

| 页面 | 主要接口 |
|:--|:--|
| LoginView | `login`、`getCurrentUser` |
| FirstVisitFormView | `getLatestFirstVisitForm`、`saveFirstVisitForm` |
| ConsentView | `getConsentStatus`、`signConsent` |
| AppointmentCreateView | `getAvailableFirstVisitSlots`、`createFirstVisitAppointment` |
| MyAppointmentsView | `getMyAppointments`、`cancelMyAppointment` |
| MyNotificationsView | `getMyNotifications` |
| UserManageView | `pageUsers`、`createUser`、`updateUser`、`enableUser`、`disableUser` |
| StaffManageView | `pageStaff`、`createStaff`、`updateStaff` |
| TimeSlotManageView | `pageTimeSlots`、`createTimeSlot`、`updateTimeSlot` |
| DutyScheduleView | `pageDutySchedules`、`createDutySchedule`、`batchCreateDutySchedules` |
| AppointmentAuditView | `pageAuditAppointments`、`approveAppointment`、`rejectAppointment`、`rescheduleAppointment` |
| InterviewTaskView | `pageInterviewTasks` |
| InterviewResultEditView | `getInterviewTaskDetail`、`submitInterviewResult` |
| ConsultationQueueView | `pageConsultationQueue`、`suspendQueue` |
| ConsultationArrangeView | `getCounselorAvailableSlots`、`arrangeConsultation`、`pageConsultationSchedules` |
| MyScheduleView | `pageMySchedules`、`getScheduleDetail` |
| ConsultationRecordEditView | `getRecordBySchedule`、`saveConsultationRecord` |
| ExtensionRequestView | `pageMyExtensionRequests`、`createExtensionRequest` |
| CaseReportEditView | `pageMyCaseReports`、`saveCaseReport`、`submitCaseReport`、`downloadMyCaseReportWord` |
| StatisticsView | `getOverview`、`getMonthlyTrend`、`getProblemTypeDistribution`、`getCrisisLevelDistribution`、`getCounselorWorkload` |
| NotificationLogView | `pageNotificationLogs` |
| OperationLogView | `pageOperationLogs` |

---

## 13. 前端联调注意事项

1. 登录成功后不要手动保存密码，只保存当前用户基础信息。
2. Session Cookie 由浏览器保存，Axios 必须开启 `withCredentials`。
3. 所有时间字段统一显示为 `YYYY-MM-DD HH:mm`，日期字段显示为 `YYYY-MM-DD`。
4. 后端返回的枚举值前端通过常量映射为中文，不要求后端返回中文。
5. 表格搜索和分页参数统一使用 `pageNum`、`pageSize`。
6. 导出接口必须使用 `responseType: 'blob'`。
7. 对 409 业务冲突要直接展示后端 message，尤其是时间冲突。
8. 所有危险操作如驳回、删除、取消安排、提交结案报告必须二次确认。
