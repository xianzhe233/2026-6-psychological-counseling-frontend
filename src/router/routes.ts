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
        path: 'admin/appointments/audit',
        name: 'AdminAppointmentAudit',
        component: () => import('@/views/admin/AppointmentAuditView.vue'),
        meta: { requiresAuth: true, roles: ['ADMIN'], title: '预约审核' }
      },
      {
        path: 'interviewer/tasks',
        name: 'InterviewerTasks',
        component: () => import('@/views/interviewer/InterviewTaskView.vue'),
        meta: { requiresAuth: true, roles: ['INTERVIEWER'], title: '初访任务' }
      },
      {
        path: 'assistant/queue',
        name: 'AssistantQueue',
        component: () => import('@/views/assistant/ConsultationQueueView.vue'),
        meta: { requiresAuth: true, roles: ['ASSISTANT'], title: '咨询队列' }
      },
      {
        path: 'counselor/schedules',
        name: 'CounselorSchedules',
        component: () => import('@/views/counselor/MyScheduleView.vue'),
        meta: { requiresAuth: true, roles: ['COUNSELOR'], title: '咨询日程' }
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
