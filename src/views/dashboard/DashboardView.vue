<script setup lang="ts">
import { NGi, NGrid } from 'naive-ui'

import DashboardWelcome from '@/components/layout/DashboardWelcome.vue'
import QuickLinkCard from '@/components/layout/QuickLinkCard.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useDashboardOverview } from '@/composables/useDashboardOverview'

const {
  quickLinks,
  statCards,
  welcomeTitle,
  welcomeDescription,
  defaultRoute,
  highlightedSections,
} = useDashboardOverview()
</script>

<template>
  <PageContainer class="dashboard-view bp-section-gap">
    <DashboardWelcome
      :title="welcomeTitle"
      :description="welcomeDescription"
      :default-route="defaultRoute"
    />

    <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <n-gi v-for="card in statCards" :key="card.label" span="1 s:2 l:3 xl:3">
        <StatCard
          :label="card.label"
          :value="card.value"
          :footer="card.footer"
          :icon="card.icon"
        />
      </n-gi>
    </n-grid>

    <SectionCard v-if="quickLinks.length" title="快捷入口" subtitle="根据当前角色展示常用功能">
      <div class="shell-quick-link-grid">
        <QuickLinkCard
          v-for="item in quickLinks"
          :key="item.key"
          :label="item.label"
          :path="item.path"
          :icon="item.icon"
        />
      </div>
    </SectionCard>

    <SectionCard title="业务模块概览" subtitle="系统按学生服务、中心管理与咨询流程组织功能">
      <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
        <n-gi v-for="section in highlightedSections" :key="section.title" span="1 l:1">
          <article
            class="shell-feature-card"
            :class="{ 'shell-feature-card--highlight': section.highlight }"
          >
            <h3 class="shell-feature-card__title">{{ section.title }}</h3>
            <span class="shell-feature-card__roles">适用：{{ section.roles }}</span>
            <p class="shell-feature-card__description">{{ section.description }}</p>
          </article>
        </n-gi>
      </n-grid>
    </SectionCard>
  </PageContainer>
</template>
