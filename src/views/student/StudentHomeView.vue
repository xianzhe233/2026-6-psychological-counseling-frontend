<script setup lang="ts">
import { NButton, NGi, NGrid, NStep, NSteps } from 'naive-ui'

import QuickLinkCard from '@/components/layout/QuickLinkCard.vue'
import StudentFeatureCard from '@/components/student/StudentFeatureCard.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { useStudentHome } from '@/composables/useStudentHome'

const { quickLinks, featurePages, contactItems } = useStudentHome()
</script>

<template>
  <PageContainer class="sp-section-gap">
    <section class="sp-welcome">
      <div>
        <span class="sp-welcome__eyebrow">学生服务</span>
        <h2 class="sp-welcome__title">学生服务中心</h2>
        <p class="sp-welcome__description">
          欢迎使用心理健康咨询预约系统，我们将为您提供专业、保密的心理支持服务。
        </p>
      </div>
      <n-button type="primary" @click="$router.push('/student/first-visit-form')">
        开始首访登记
      </n-button>
    </section>

    <SectionCard title="快捷入口" subtitle="按预约流程快速进入常用功能">
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

    <n-grid :cols="1" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <n-gi span="1 l:1">
        <SectionCard title="预约流程" subtitle="完成以下步骤即可预约初访">
          <n-steps vertical :current="1" size="small" class="sp-flow-steps">
            <n-step title="首访登记" description="填写个人信息和来访原因" />
            <n-step title="知情同意" description="阅读并签署知情同意书" />
            <n-step title="选择时间" description="选择合适的咨询时间段" />
            <n-step title="等待审核" description="中心审核并安排咨询师" />
            <n-step title="开始咨询" description="按时到达咨询室进行咨询" />
          </n-steps>
        </SectionCard>
      </n-gi>

      <n-gi span="1 l:1">
        <SectionCard title="服务说明" subtitle="心理咨询中心服务承诺">
          <p>心理咨询中心为在校学生提供免费、保密的心理咨询服务。</p>
          <ul class="sp-info-list">
            <li>咨询内容严格保密</li>
            <li>专业咨询师团队</li>
            <li>多种咨询方式可选</li>
            <li>定期跟踪回访</li>
          </ul>
          <p class="sp-notice-banner">首次咨询需要完成首访登记和知情同意。</p>
        </SectionCard>
      </n-gi>

      <n-gi span="1 l:1">
        <SectionCard title="联系方式" subtitle="如需帮助可随时联系中心">
          <div
            v-for="item in contactItems"
            :key="item.label"
            class="sp-contact-item"
          >
            <span class="sp-contact-item__label">{{ item.label }}</span>
            <span class="sp-contact-item__value">{{ item.value }}</span>
          </div>
        </SectionCard>
      </n-gi>
    </n-grid>

    <SectionCard title="功能说明" subtitle="各页面用途与操作指引">
      <div class="sp-feature-grid">
        <StudentFeatureCard
          v-for="item in featurePages"
          :key="item.title"
          :title="item.title"
          :desc="item.desc"
          :tag="item.tag"
          :tag-type="item.tagType"
          :path="item.path"
        />
      </div>
    </SectionCard>
  </PageContainer>
</template>
