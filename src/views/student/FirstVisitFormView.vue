<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NInputNumber, NRadioGroup, NRadio, NButton, NSpace, useMessage } from 'naive-ui'
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
  emergencyFlag: 0
})

const loading = ref(false)
const existingForm = ref<FirstVisitForm | null>(null)

onMounted(async () => {
  try {
    const { data } = await getLatestFirstVisitForm()
    if (data.data) {
      existingForm.value = data.data
      form.value = {
        mainProblem: data.data.mainProblem,
        problemDescription: data.data.problemDescription,
        expectedHelp: data.data.expectedHelp,
        moodScore: data.data.moodScore,
        sleepScore: data.data.sleepScore,
        stressScore: data.data.stressScore,
        selfHarmFlag: data.data.selfHarmFlag,
        emergencyFlag: data.data.emergencyFlag
      }
    }
  } catch (error) {
    console.error('获取首访登记表失败', error)
  }
})

async function handleSubmit() {
  if (!form.value.mainProblem.trim()) {
    message.error('请填写主要困扰')
    return
  }
  if (!form.value.problemDescription.trim()) {
    message.error('请填写问题详细描述')
    return
  }
  if (!form.value.expectedHelp.trim()) {
    message.error('请填写期望帮助')
    return
  }

  loading.value = true
  try {
    await saveFirstVisitForm(form.value)
    message.success('提交成功')
    router.push('/student/consent')
  } catch (error: any) {
    message.error(error?.message || '提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="first-visit-form-view">
    <PageHeader title="首访登记表" description="填写基本信息以便我们了解您的情况" />
    <n-card class="form-card">
      <n-form label-placement="left" label-width="120">
        <n-form-item label="主要困扰" required>
          <n-input
            v-model:value="form.mainProblem"
            placeholder="请简要描述您当前的主要困扰"
            maxlength="100"
            show-count
          />
        </n-form-item>

        <n-form-item label="问题详细描述" required>
          <n-input
            v-model:value="form.problemDescription"
            type="textarea"
            placeholder="请详细描述您遇到的问题，包括持续时间、影响等"
            maxlength="500"
            show-count
            :rows="4"
          />
        </n-form-item>

        <n-form-item label="期望获得帮助" required>
          <n-input
            v-model:value="form.expectedHelp"
            type="textarea"
            placeholder="请描述您希望获得什么样的帮助"
            maxlength="300"
            show-count
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="情绪评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.moodScore"
              :min="1"
              :max="10"
              placeholder="1-10分"
            />
            <span class="score-hint">1分表示情绪很差，10分表示情绪很好</span>
          </n-space>
        </n-form-item>

        <n-form-item label="睡眠评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.sleepScore"
              :min="1"
              :max="10"
              placeholder="1-10分"
            />
            <span class="score-hint">1分表示睡眠很差，10分表示睡眠很好</span>
          </n-space>
        </n-form-item>

        <n-form-item label="压力评分">
          <n-space vertical>
            <n-input-number
              v-model:value="form.stressScore"
              :min="1"
              :max="10"
              placeholder="1-10分"
            />
            <span class="score-hint">1分表示压力很小，10分表示压力很大</span>
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
            {{ existingForm ? '更新' : '提交' }}
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