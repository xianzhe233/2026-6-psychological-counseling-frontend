import type { Component } from 'vue'
import { computed } from 'vue'
import {
  AppsOutline,
  PersonOutline,
  ShieldCheckmarkOutline,
  SparklesOutline,
} from '@vicons/ionicons5'

import { dashboardMenu, roleMenus } from '@/constants/menus'
import { getRoleLabel } from '@/constants/role-labels'
import { getDefaultRouteByRoles } from '@/stores/auth'
import { useAuthStore } from '@/stores/auth'
import type { MenuItem } from '@/constants/menus'

export interface DashboardStatItem {
  label: string
  value: string | number
  footer?: string
  icon: Component
}

export interface DashboardFeatureSection {
  title: string
  description: string
  roles: string
  highlight?: boolean
}

const featureSections: DashboardFeatureSection[] = [
  {
    title: '学生服务',
    description: '支持首访登记、知情同意、预约提交、预约查询与通知查看。',
    roles: '学生',
  },
  {
    title: '中心管理',
    description: '支持基础配置、预约审核、结案报告管理、统计看板与日志查询。',
    roles: '管理员',
  },
  {
    title: '咨询流程',
    description: '覆盖初访任务、正式咨询安排、咨询记录、追加申请与结案管理。',
    roles: '初访员 / 助理 / 咨询师',
  },
]

export function useDashboardOverview() {
  const auth = useAuthStore()

  const accessibleMenus = computed<MenuItem[]>(() => {
    const items = [dashboardMenu]
    for (const role of auth.roles) {
      items.push(...roleMenus[role])
    }
    return items
  })

  const quickLinks = computed(() =>
    accessibleMenus.value.filter(item => item.key !== 'dashboard').slice(0, 6),
  )

  const statCards = computed<DashboardStatItem[]>(() => [
    {
      label: '当前账号',
      value: auth.user?.realName || '未登录',
      footer: auth.user?.username ? `@${auth.user.username}` : undefined,
      icon: PersonOutline,
    },
    {
      label: '主角色',
      value: getRoleLabel(auth.user?.primaryRole ?? 'STUDENT'),
      footer: auth.roles.length > 1 ? `共 ${auth.roles.length} 个角色` : '单一角色',
      icon: ShieldCheckmarkOutline,
    },
    {
      label: '可访问功能',
      value: Math.max(accessibleMenus.value.length - 1, 0),
      footer: '侧栏菜单入口数',
      icon: AppsOutline,
    },
    {
      label: '工作台状态',
      value: '就绪',
      footer: '按角色展示业务入口',
      icon: SparklesOutline,
    },
  ])

  const welcomeTitle = computed(() => {
    const name = auth.user?.realName || '用户'
    return `你好，${name}`
  })

  const welcomeDescription = computed(() => {
    const roleText = getRoleLabel(auth.user?.primaryRole ?? 'STUDENT')
    return `当前以「${roleText}」身份登录，可从下方快捷入口进入常用功能。`
  })

  const defaultRoute = computed(() => getDefaultRouteByRoles(auth.roles))

  const highlightedSections = computed(() =>
    featureSections.map(section => ({
      ...section,
      highlight:
        (section.title === '学生服务' && auth.roles.includes('STUDENT'))
        || (section.title === '中心管理' && auth.roles.includes('ADMIN'))
        || (section.title === '咨询流程' && (
          auth.roles.includes('INTERVIEWER')
          || auth.roles.includes('ASSISTANT')
          || auth.roles.includes('COUNSELOR')
        )),
    })),
  )

  return {
    accessibleMenus,
    quickLinks,
    statCards,
    welcomeTitle,
    welcomeDescription,
    defaultRoute,
    highlightedSections,
  }
}
