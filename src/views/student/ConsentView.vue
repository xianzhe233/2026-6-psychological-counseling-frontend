<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NCheckbox, NButton, NSpace, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getConsentStatus, signConsent, getLatestFirstVisitForm } from '@/api/student'
import type { ConsentStatus } from '@/types/student'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const formId = ref<number>(0)
const consentStatus = ref<ConsentStatus | null>(null)
const agreed = ref(false)
const loading = ref(false)

onMounted(async () => {
  let queryFormId = route.query.formId

  if (!queryFormId) {
    try {
      const { data } = await getLatestFirstVisitForm()
      if (data.data) {
        queryFormId = data.data.id
      }
    } catch (error) {
      console.error('获取首访登记表失败', error)
    }
  }

  if (!queryFormId) {
    message.warning('请先填写首访登记表')
    router.push('/student/first-visit-form')
    return
  }
  formId.value = Number(queryFormId)

  try {
    const { data } = await getConsentStatus(formId.value)
    consentStatus.value = data.data
    if (consentStatus.value?.signed) {
      agreed.value = true
    }
  } catch (error) {
    console.error('获取同意书状态失败', error)
  }
})

async function handleSign() {
  if (!agreed.value) {
    message.error('请先阅读并同意知情同意书')
    return
  }

  loading.value = true
  try {
    await signConsent({
      formId: formId.value,
      consentVersion: 'v1.0'
    })
    message.success('签署成功')
    router.push('/student/appointment-create')
  } catch (error: any) {
    message.error(error?.message || '签署失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="consent-view">
    <PageHeader title="知情同意书" description="请仔细阅读以下内容并签署同意" />
    <n-card class="consent-card">
      <div class="consent-content">
        <h3>咨询服务性质说明</h3>
        <p>本中心提供的心理咨询服务旨在帮助大学生解决在学习、生活中遇到的心理困扰，促进个人成长和发展。咨询服务包括个体咨询、团体咨询、心理测评等形式。</p>

        <h3>隐私保护说明</h3>
        <p>我们严格遵守保密原则，保护您的个人隐私。咨询内容、测评结果等个人信息将严格保密，未经您本人同意，不会向任何第三方披露。但在以下情况下，我们可能需要打破保密原则：</p>

        <h3>例外情况说明</h3>
        <ul>
          <li>当您有自杀、自伤或伤害他人的风险时</li>
          <li>当法律要求披露时</li>
          <li>当您同意披露时</li>
        </ul>

        <h3>预约规则说明</h3>
        <p>1. 请提前预约咨询时间，按时到达咨询室。</p>
        <p>2. 如需取消或更改预约，请提前24小时通知。</p>
        <p>3. 每次咨询时长约为50分钟。</p>
        <p>4. 咨询频率根据具体情况由咨询师和您共同商定。</p>
      </div>

      <div class="consent-actions">
        <n-checkbox v-model:checked="agreed" :disabled="consentStatus?.signed">
          我已阅读并同意知情同意书
        </n-checkbox>

        <n-space>
          <n-button
            type="primary"
            :loading="loading"
            :disabled="!agreed || consentStatus?.signed"
            @click="handleSign"
          >
            {{ consentStatus?.signed ? '已签署' : '签署同意' }}
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.consent-view {
  padding: 24px;
}

.consent-card {
  margin-top: 24px;
}

.consent-content {
  margin-bottom: 24px;
}

.consent-content h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
}

.consent-content p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.consent-content ul {
  margin-left: 20px;
  margin-bottom: 10px;
}

.consent-content li {
  margin-bottom: 5px;
  line-height: 1.6;
}

.consent-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>