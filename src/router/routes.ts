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
        path: 'student/appointments',
        name: 'StudentAppointments',
        component: () => import('@/views/student/MyAppointmentsView.vue'),
        meta: { requiresAuth: true, roles: ['STUDENT'], title: '我的预约' }
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
