import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: '登录' }
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAuth: true, title: '工作台' }
      },
      {
        path: 'student',
        name: 'StudentHome',
        component: () => import('@/views/student/StudentHomeView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '学生首页' }
      },
      {
        path: 'student/first-visit-form',
        name: 'StudentFirstVisitForm',
        component: () => import('@/views/student/FirstVisitFormView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '首访登记表' }
      },
      {
        path: 'student/consent',
        name: 'StudentConsent',
        component: () => import('@/views/student/ConsentView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '知情同意书' }
      },
      {
        path: 'student/appointment-create',
        name: 'StudentAppointmentCreate',
        component: () => import('@/views/student/AppointmentCreateView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '初访预约' }
      },
      {
        path: 'student/appointments',
        name: 'StudentAppointments',
        component: () => import('@/views/student/MyAppointmentsView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '我的预约' }
      },
      {
        path: 'student/notifications',
        name: 'StudentNotifications',
        component: () => import('@/views/student/MyNotificationsView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '我的通知' }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManageView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '用户管理' }
      },
      {
        path: 'admin/staff',
        name: 'AdminStaff',
        component: () => import('@/views/admin/StaffManageView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '工作人员管理' }
      },
      {
        path: 'admin/rooms',
        name: 'AdminRooms',
        component: () => import('@/views/admin/RoomManageView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '咨询室管理' }
      },
      {
        path: 'admin/time-slots',
        name: 'AdminTimeSlots',
        component: () => import('@/views/admin/TimeSlotManageView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '时间段配置' }
      },
      {
        path: 'admin/duty-schedules',
        name: 'AdminDutySchedules',
        component: () => import('@/views/admin/DutyScheduleView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '值班管理' }
      },
      {
        path: 'admin/appointments/audit',
        name: 'AdminAppointmentAudit',
        component: () => import('@/views/admin/AppointmentAuditView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '预约审核' }
      },
      {
        path: 'admin/statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/StatisticsView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '统计看板' }
      },
      {
        path: 'admin/case-reports',
        name: 'AdminCaseReports',
        component: () => import('@/views/admin/CaseReportManageView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '结案报告管理' }
      },
      {
        path: 'admin/logs/notifications',
        name: 'AdminNotificationLogs',
        component: () => import('@/views/admin/NotificationLogView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '通知日志' }
      },
      {
        path: 'admin/logs/operations',
        name: 'AdminOperationLogs',
        component: () => import('@/views/admin/OperationLogView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '操作日志' }
      },
      {
        path: 'interviewer/tasks',
        name: 'InterviewerTasks',
        component: () => import('@/views/interviewer/InterviewTaskView.vue'),
        meta: { requiresAuth: true, roles: ['INTERVIEWER'], title: '初访任务' }
      },
      {
        path: 'interviewer/tasks/:id/result',
        name: 'InterviewResultEdit',
        component: () => import('@/views/interviewer/InterviewResultEditView.vue'),
        meta: { requiresAuth: true, roles: ['INTERVIEWER'], title: '初访结果录入' }
      },
      {
        path: 'assistant/queue',
        name: 'AssistantQueue',
        component: () => import('@/views/assistant/ConsultationQueueView.vue'),
        meta: { requiresAuth: true, roles: ['ASSISTANT'], title: '咨询队列' }
      },
      {
        path: 'assistant/arrange',
        name: 'AssistantArrangeEntry',
        component: () => import('@/views/assistant/ConsultationArrangeView.vue'),
        meta: { requiresAuth: true, roles: ['ASSISTANT'], title: '正式咨询安排' }
      },
      {
        path: 'assistant/queue/:id/arrange',
        name: 'AssistantArrange',
        component: () => import('@/views/assistant/ConsultationArrangeView.vue'),
        meta: { requiresAuth: true, roles: ['ASSISTANT'], title: '正式咨询安排' }
      },
      {
        path: 'counselor/schedules',
        name: 'CounselorSchedules',
        component: () => import('@/views/counselor/MyScheduleView.vue'),
        meta: { requiresAuth: true, roles: ['COUNSELOR'], title: '咨询日程' }
      },
      {
        path: 'counselor/records/:scheduleId',
        name: 'CounselorRecordEdit',
        component: () => import('@/views/counselor/ConsultationRecordEditView.vue'),
        meta: { requiresAuth: true, roles: ['COUNSELOR'], title: '咨询记录录入' }
      },
      {
        path: 'counselor/extensions',
        name: 'CounselorExtensions',
        component: () => import('@/views/counselor/ExtensionRequestView.vue'),
        meta: { requiresAuth: true, roles: ['COUNSELOR'], title: '追加咨询申请' }
      },
      {
        path: 'counselor/case-reports',
        name: 'CounselorCaseReports',
        component: () => import('@/views/counselor/CaseReportEditView.vue'),
        meta: { requiresAuth: true, roles: ['COUNSELOR'], title: '结案报告' }
      }
    ]
  },
  {
    path: '/403',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: 'Forbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
        meta: { title: '无权限' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        name: 'NotFound',
        component: () => import('@/views/error/NotFoundView.vue'),
        meta: { title: '页面不存在' }
      }
    ]
  }
]
