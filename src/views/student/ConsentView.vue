<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NButton, NCheckbox, useMessage } from 'naive-ui'

import PageHeader from '@/components/common/PageHeader.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { getConsentStatus, getLatestFirstVisitForm, signConsent } from '@/api/student'
import type { ConsentStatus } from '@/types/student'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const formId = ref<number | null>(null)
const consentStatus = ref<ConsentStatus | null>(null)
const agreed = ref(false)
const loading = ref(false)

const isSigned = computed(() => consentStatus.value?.signed === true || consentStatus.value?.signed === 1)

function parseFormId(rawValue: unknown) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as {
    response?: { data?: { message?: string } }
    message?: string
  }
  return maybeError?.response?.data?.message || maybeError?.message || fallback
}

onMounted(async () => {
  formId.value = parseFormId(route.query.formId)

  if (!formId.value) {
    try {
      const { data } = await getLatestFirstVisitForm()
      formId.value = data.data?.id ?? null
    } catch {
      formId.value = null
    }
  }

  if (!formId.value) {
    return
  }

  try {
    const { data } = await getConsentStatus(formId.value)
    consentStatus.value = data.data
    if (isSigned.value) {
      agreed.value = true
    }
  } catch (error) {
    message.error(getErrorMessage(error, '获取知情同意状态失败'))
  }
})

async function handlePrimaryAction() {
  if (!formId.value) {
    message.error('请先提交首访登记表')
    return
  }

  if (isSigned.value) {
    await router.push({
      path: '/student/appointment-create',
      query: { formId: String(formId.value) },
    })
    return
  }

  if (!agreed.value) {
    message.error('请先阅读并同意知情同意书')
    return
  }

  loading.value = true
  try {
    await signConsent({
      formId: formId.value,
      consentVersion: 'v1.0',
    })
    consentStatus.value = {
      formId: formId.value,
      signed: true,
      signTime: new Date().toISOString(),
      consentVersion: 'v1.0',
    }
    message.success('签署成功，接下来请选择预约时间')
    await router.push({
      path: '/student/appointment-create',
      query: { formId: String(formId.value) },
    })
  } catch (error) {
    message.error(getErrorMessage(error, '签署失败'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer class="sp-section-gap">
    <PageHeader title="知情同意书" description="请仔细阅读以下内容并签署同意。" />

    <SectionCard title="知情同意内容" subtitle="签署前请完整阅读以下条款">
      <n-alert v-if="!formId" type="warning" style="margin-bottom: 16px">
        当前未检测到可签署的首访登记表，请先返回「首访登记表」完成提交，再继续预约流程。
      </n-alert>

      <div class="sp-consent-content">
        <h3>咨询服务性质说明</h3>
        <p>本中心提供的心理咨询服务，旨在帮助同学们更好地应对学习、生活和成长中的心理困扰，促进个人适应与发展。</p>

        <h3>隐私保护说明</h3>
        <p>我们将严格保护您的个人信息与咨询内容。除法律法规要求或确有安全保护需要外，不会随意向无关人员披露。</p>

        <h3>例外情况说明</h3>
        <ul>
          <li>当存在明显的人身安全风险时</li>
          <li>当法律法规要求提供相关信息时</li>
          <li>当您本人明确同意授权披露时</li>
        </ul>

        <h3>预约规则说明</h3>
        <p>1. 请按预约时间准时到场，如需调整，请尽量提前联系老师。</p>
        <p>2. 每次咨询时长以排班安排为准，现场请保持手机静音。</p>
        <p>3. 后续咨询频率与安排，将由老师结合实际情况与您共同协商。</p>
      </div>

      <div class="sp-consent-actions">
        <div>
          <n-checkbox v-model:checked="agreed" :disabled="isSigned">
            我已阅读并同意知情同意书
          </n-checkbox>
          <p v-if="isSigned" class="sp-consent-status">您已完成签署，可直接进入预约页面。</p>
        </div>

        <n-button
          type="primary"
          :loading="loading"
          :disabled="!formId || (!isSigned && !agreed)"
          @click="handlePrimaryAction"
        >
          {{ isSigned ? '前往预约' : '签署同意并继续' }}
        </n-button>
      </div>
    </SectionCard>
  </PageContainer>
</template>
