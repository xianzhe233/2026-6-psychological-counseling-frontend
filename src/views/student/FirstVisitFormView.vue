<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NRadio, NRadioGroup, NSpace, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getLatestFirstVisitForm, saveFirstVisitForm } from '@/api/student'
import type { FirstVisitForm, FirstVisitFormRequest } from '@/types/student'

const router = useRouter()
const message = useMessage()

const form = ref<FirstVisitFormRequest>({
  mainProblem: '',
  problemDescription: '',
  expectedHelp: '',
  moodScore: 5,
  sleepScore: 5,
  stressScore: 5,
  selfHarmFlag: 0,
  emergencyFlag: 0,
})

const loading = ref(false)
const existingForm = ref<FirstVisitForm | null>(null)

function getErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as {
    response?: { data?: { message?: string } }
    message?: string
  }
  return maybeError?.response?.data?.message || maybeError?.message || fallback
}

function buildPayload(): FirstVisitFormRequest {
  return {
    ...form.value,
    mainProblem: form.value.mainProblem.trim(),
    problemDescription: form.value.problemDescription.trim(),
    expectedHelp: form.value.expectedHelp.trim(),
  }
}

onMounted(async () => {
  try {
    const { data } = await getLatestFirstVisitForm()
    if (data.data) {
      existingForm.value = data.data
      form.value = {
        mainProblem: data.data.mainProblem,
        problemDescription: data.data.problemDescription ?? '',
        expectedHelp: data.data.expectedHelp ?? '',
        moodScore: data.data.moodScore,
        sleepScore: data.data.sleepScore,
        stressScore: data.data.stressScore,
        selfHarmFlag: data.data.selfHarmFlag,
        emergencyFlag: data.data.emergencyFlag,
      }
    }
  } catch (error) {
    console.error('获取首访登记表失败', error)
  }
})

async function handleSubmit() {
  const payload = buildPayload()

  if (!payload.mainProblem) {
    message.error('请填写主要困扰')
    return
  }
  if (!payload.problemDescription) {
    message.error('请填写问题详细描述')
    return
  }
  if (!payload.expectedHelp) {
    message.error('请填写期望帮助')
    return
  }

  loading.value = true
  try {
    const { data } = await saveFirstVisitForm(payload)
    const formId = data.data?.id ?? existingForm.value?.id

    message.success('登记表已提交，请继续签署知情同意书')
    await router.push(
      formId
        ? {
            path: '/student/consent',
            query: { formId: String(formId) },
          }
        : '/student/consent',
    )
  } catch (error) {
    message.error(getErrorMessage(error, '提交失败'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="first-visit-form-view">
    <PageHeader title="首访登记表" description="请如实填写，信息仅用于心理咨询服务与预约安排。" />
    <n-card class="form-card">
      <n-form label-placement="left" label-width="120">
        <n-form-item label="主要困扰" required>
          <n-input
            v-model:value="form.mainProblem"
            placeholder="请简要描述您当前最想解决的问题"
            maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item label="问题详细描述" required>
          <n-input
            v-model:value="form.problemDescription"
            type="textarea"
            placeholder="可补充问题持续时间、对学习生活的影响，以及最近的变化。"
            maxlength="1000"
            show-count
            :rows="4"
          />
        </n-form-item>

        <n-form-item label="期望获得帮助" required>
          <n-input
            v-model:value="form.expectedHelp"
            type="textarea"
            placeholder="例如希望获得情绪支持、压力疏导或沟通建议。"
            maxlength="500"
            show-count
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="情绪评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.moodScore"
              :min="0"
              :max="10"
              placeholder="0-10分"
            />
            <span class="score-hint">0 分表示基本稳定，10 分表示当前困扰非常明显。</span>
          </n-space>
        </n-form-item>

        <n-form-item label="睡眠评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.sleepScore"
              :min="0"
              :max="10"
              placeholder="0-10分"
            />
            <span class="score-hint">0 分表示睡眠影响很小，10 分表示睡眠困扰非常明显。</span>
          </n-space>
        </n-form-item>

        <n-form-item label="压力评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.stressScore"
              :min="0"
              :max="10"
              placeholder="0-10分"
            />
            <span class="score-hint">0 分表示压力较小，10 分表示当前压力非常明显。</span>
          </n-space>
        </n-form-item>

        <n-form-item label="自伤风险">
          <n-radio-group v-model:value="form.selfHarmFlag">
            <n-space>
              <n-radio :value="0">无</n-radio>
              <n-radio :value="1">有</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="紧急求助">
          <n-radio-group v-model:value="form.emergencyFlag">
            <n-space>
              <n-radio :value="0">否</n-radio>
              <n-radio :value="1">是</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item>
          <n-button type="primary" :loading="loading" @click="handleSubmit">
            {{ existingForm ? '更新并继续' : '提交并继续' }}
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped>
.first-visit-form-view {
  padding: 24px;
}

.form-card {
  margin-top: 24px;
}

.score-hint {
  font-size: 12px;
  color: #999;
}
</style>
