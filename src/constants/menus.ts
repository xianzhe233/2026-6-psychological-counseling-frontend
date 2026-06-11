import type { Component } from 'vue'
import { HomeOutline } from '@vicons/ionicons5'

import { pageIcons } from '@/constants/icons'
import type { RoleCode } from '@/types/auth'

export interface MenuItem {
  key: string
  label: string
  path: string
  icon: Component
}

export const roleMenus: Record<RoleCode, MenuItem[]> = {
  STUDENT: [
    { key: 'student-first-visit-form', label: '首访登记表', path: '/student/first-visit-form', icon: pageIcons['student-first-visit-form'] },
    { key: 'student-consent', label: '知情同意书', path: '/student/consent', icon: pageIcons['student-consent'] },
    { key: 'student-appointment-create', label: '初访预约', path: '/student/appointment-create', icon: pageIcons['student-appointment-create'] },
    { key: 'student-appointments', label: '我的预约', path: '/student/appointments', icon: pageIcons['student-appointments'] },
    { key: 'student-notifications', label: '我的通知', path: '/student/notifications', icon: pageIcons['student-notifications'] },
  ],
  ADMIN: [
    { key: 'admin-users', label: '用户管理', path: '/admin/users', icon: pageIcons['admin-users'] },
    { key: 'admin-staff', label: '工作人员管理', path: '/admin/staff', icon: pageIcons['admin-staff'] },
    { key: 'admin-rooms', label: '咨询室管理', path: '/admin/rooms', icon: pageIcons['admin-rooms'] },
    { key: 'admin-time-slots', label: '时间段配置', path: '/admin/time-slots', icon: pageIcons['admin-time-slots'] },
    { key: 'admin-duty-schedules', label: '值班管理', path: '/admin/duty-schedules', icon: pageIcons['admin-duty-schedules'] },
    { key: 'admin-audit', label: '预约审核', path: '/admin/appointments/audit', icon: pageIcons['admin-audit'] },
    { key: 'admin-statistics', label: '统计看板', path: '/admin/statistics', icon: pageIcons['admin-statistics'] },
    { key: 'admin-case-reports', label: '结案报告管理', path: '/admin/case-reports', icon: pageIcons['admin-case-reports'] },
    { key: 'admin-notification-logs', label: '通知日志', path: '/admin/logs/notifications', icon: pageIcons['admin-notification-logs'] },
    { key: 'admin-operation-logs', label: '操作日志', path: '/admin/logs/operations', icon: pageIcons['admin-operation-logs'] },
  ],
  INTERVIEWER: [
    { key: 'interviewer-tasks', label: '初访任务', path: '/interviewer/tasks', icon: pageIcons['interviewer-tasks'] },
  ],
  ASSISTANT: [
    { key: 'assistant-queue', label: '咨询队列', path: '/assistant/queue', icon: pageIcons['assistant-queue'] },
    { key: 'assistant-arrange', label: '咨询安排', path: '/assistant/arrange', icon: pageIcons['assistant-arrange'] },
  ],
  COUNSELOR: [
    { key: 'counselor-schedules', label: '咨询日程', path: '/counselor/schedules', icon: pageIcons['counselor-schedules'] },
    { key: 'counselor-extensions', label: '追加申请', path: '/counselor/extensions', icon: pageIcons['counselor-extensions'] },
    { key: 'counselor-case-reports', label: '结案报告', path: '/counselor/case-reports', icon: pageIcons['counselor-case-reports'] },
  ],
}

export const dashboardMenu: MenuItem = {
  key: 'dashboard',
  label: '工作台',
  path: '/dashboard',
  icon: HomeOutline,
}
