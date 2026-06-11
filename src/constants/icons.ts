import type { Component } from 'vue'
import {
  BarChartOutline,
  BusinessOutline,
  CalendarOutline,
  ClipboardOutline,
  DocumentTextOutline,
  GridOutline,
  HomeOutline,
  ListOutline,
  MailOutline,
  NotificationsOutline,
  PeopleOutline,
  PersonOutline,
  PulseOutline,
  ReaderOutline,
  SearchOutline,
  SettingsOutline,
  TimeOutline,
} from '@vicons/ionicons5'

import type { RoleCode } from '@/types/auth'

export interface IconOption {
  key: string
  label: string
  icon: Component
}

/** 页面/路由图标映射 */
export const pageIcons: Record<string, Component> = {
  dashboard: HomeOutline,
  login: PersonOutline,
  'student-home': HomeOutline,
  'student-first-visit-form': DocumentTextOutline,
  'student-consent': ReaderOutline,
  'student-appointment-create': CalendarOutline,
  'student-appointments': TimeOutline,
  'student-notifications': MailOutline,
  'admin-users': PeopleOutline,
  'admin-staff': BusinessOutline,
  'admin-rooms': GridOutline,
  'admin-time-slots': TimeOutline,
  'admin-duty-schedules': SettingsOutline,
  'admin-audit': SearchOutline,
  'admin-statistics': BarChartOutline,
  'admin-case-reports': DocumentTextOutline,
  'admin-notification-logs': NotificationsOutline,
  'admin-operation-logs': ListOutline,
  'interviewer-tasks': ClipboardOutline,
  'assistant-queue': PulseOutline,
  'assistant-arrange': CalendarOutline,
  'counselor-schedules': CalendarOutline,
  'counselor-extensions': DocumentTextOutline,
  'counselor-case-reports': ReaderOutline,
}

/** 按角色分组的菜单图标（与 menus.ts key 对应） */
export const roleMenuIcons: Record<RoleCode, Record<string, Component>> = {
  STUDENT: {
    'student-first-visit-form': pageIcons['student-first-visit-form'],
    'student-consent': pageIcons['student-consent'],
    'student-appointment-create': pageIcons['student-appointment-create'],
    'student-appointments': pageIcons['student-appointments'],
    'student-notifications': pageIcons['student-notifications'],
  },
  ADMIN: {
    'admin-users': pageIcons['admin-users'],
    'admin-staff': pageIcons['admin-staff'],
    'admin-rooms': pageIcons['admin-rooms'],
    'admin-time-slots': pageIcons['admin-time-slots'],
    'admin-duty-schedules': pageIcons['admin-duty-schedules'],
    'admin-audit': pageIcons['admin-audit'],
    'admin-statistics': pageIcons['admin-statistics'],
    'admin-case-reports': pageIcons['admin-case-reports'],
    'admin-notification-logs': pageIcons['admin-notification-logs'],
    'admin-operation-logs': pageIcons['admin-operation-logs'],
  },
  INTERVIEWER: {
    'interviewer-tasks': pageIcons['interviewer-tasks'],
  },
  ASSISTANT: {
    'assistant-queue': pageIcons['assistant-queue'],
    'assistant-arrange': pageIcons['assistant-arrange'],
  },
  COUNSELOR: {
    'counselor-schedules': pageIcons['counselor-schedules'],
    'counselor-extensions': pageIcons['counselor-extensions'],
    'counselor-case-reports': pageIcons['counselor-case-reports'],
  },
}

export function getPageIcon(key: string, fallback: Component = GridOutline): Component {
  return pageIcons[key] ?? fallback
}

export function getMenuIcon(role: RoleCode, key: string, fallback: Component = GridOutline): Component {
  return roleMenuIcons[role]?.[key] ?? pageIcons[key] ?? fallback
}
