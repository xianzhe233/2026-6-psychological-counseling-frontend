<script setup lang="ts">
import { NCard, NGrid, NGridItem, NSteps, NStep, NSpace, NTag } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'

const pages = [
  {
    title: '首访登记表',
    desc: '填写个人基本信息、来访原因和紧急联系人等，建立初始档案。',
    tag: '必填'
  },
  {
    title: '知情同意书',
    desc: '阅读并签署知情同意书，了解咨询保密原则和相关权利义务。',
    tag: '必填'
  },
  {
    title: '初访预约',
    desc: '选择合适的日期和时间段，提交初访预约申请，等待中心审核。',
    tag: '预约'
  },
  {
    title: '我的预约',
    desc: '查看预约审核状态、历史预约记录和咨询安排详情。',
    tag: '查询'
  },
  {
    title: '我的通知',
    desc: '接收预约审核结果、咨询提醒和其他系统通知消息。',
    tag: '通知'
  }
]
</script>

<template>
  <div class="student-home">
    <PageHeader title="学生服务中心" description="欢迎使用心理健康咨询预约系统，我们将为您提供专业的心理支持服务。" />

    <n-grid cols="1 s:2 l:3" responsive="screen" :x-gap="16" :y-gap="16">
      <n-grid-item>
        <n-card title="预约流程" class="process-card">
          <n-steps vertical :current="3" size="small">
            <n-step title="首访登记" description="填写个人信息和来访原因" />
            <n-step title="知情同意" description="阅读并签署知情同意书" />
            <n-step title="选择时间" description="选择合适的咨询时间段" />
            <n-step title="等待审核" description="中心审核并安排咨询师" />
            <n-step title="开始咨询" description="按时到达咨询室进行咨询" />
          </n-steps>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="服务说明" class="info-card">
          <div class="info-content">
            <p>心理咨询中心为在校学生提供免费、保密的心理咨询服务。</p>
            <ul>
              <li>咨询内容严格保密</li>
              <li>专业咨询师团队</li>
              <li>多种咨询方式可选</li>
              <li>定期跟踪回访</li>
            </ul>
            <p class="notice">首次咨询需要完成首访登记和知情同意。</p>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="联系方式" class="contact-card">
          <div class="info-content">
            <p><strong>咨询电话：</strong>010-12345678</p>
            <p><strong>服务时间：</strong>周一至周五 8:30-17:30</p>
            <p><strong>咨询地点：</strong>学生活动中心 3 层</p>
            <p><strong>紧急情况：</strong>24 小时心理热线 400-161-9995</p>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="页面说明" class="features-card">
      <n-grid cols="1 s:2 m:3 l:5" responsive="screen" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="item in pages" :key="item.title">
          <n-card class="feature-item">
            <template #header>
              <n-space align="center">
                <span>{{ item.title }}</span>
                <n-tag size="small" :type="item.tag === '必填' ? 'warning' : 'info'">{{ item.tag }}</n-tag>
              </n-space>
            </template>
            {{ item.desc }}
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-card>
  </div>
</template>

<style scoped>
.student-home {
  padding: 24px;
}

.process-card,
.info-card,
.contact-card {
  height: 100%;
}

.info-content {
  line-height: 1.8;
}

.info-content ul {
  padding-left: 20px;
  margin: 12px 0;
}

.info-content li {
  margin-bottom: 8px;
}

.notice {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff7e6;
  border-radius: 4px;
  color: #d4a017;
}

.features-card {
  margin-top: 16px;
}

.feature-item {
  height: 100%;
}
</style>
