<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NSpin,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import {
  arrangeFormalConsultation,
  getConsultationArrangeDetail,
  getConsultationCounselorOptions,
  getConsultationRoomOptions,
  getConsultationTimeSlotOptions,
} from '@/api/assistant'
import type { ConsultationArrangeDetailVO, FormalConsultationArrangeRequest } from '@/api/assistant'
import type { OptionItem } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const queueId = computed(() => Number(route.params.id || 0))
const loading = ref(false)
const submitting = ref(false)
const submitError = ref('')
const detail = ref<ConsultationArrangeDetailVO | null>(null)
const counselorOptions = ref<OptionItem[]>([])
const roomOptions = ref<OptionItem[]>([])
const timeSlotOptions = ref<OptionItem[]>([])

const form = reactive<FormalConsultationArrangeRequest>({
  counselorId: 0,
  consultationDate: '',
  slotId: 0,
  roomId: 0,
  remark: '',
})

const selectedCounselor = computed(() => counselorOptions.value.find(item => item.value === form.counselorId))
const selectedRoom = computed(() => roomOptions.value.find(item => item.value === form.roomId))
const selectedSlot = computed(() => timeSlotOptions.value.find(item => item.value === form.slotId))

const arrangePreview = computed(() => {
  if (!detail.value || !selectedCounselor.value || !selectedRoom.value || !selectedSlot.value || !form.consultationDate) {
    return ''
  }
  return `${detail.value.studentName} 将于 ${form.consultationDate} ${selectedSlot.value.label} 在 ${selectedRoom.value.label} 接受 ${selectedCounselor.value.label} 的正式咨询`
})

function fillFormFromArrangedInfo() {
  const arranged = detail.value?.arrangedInfo
  if (!arranged) return

  form.counselorId = arranged.counselorId
  form.consultationDate = arranged.consultationDate
  form.slotId = arranged.slotId
  form.roomId = arranged.roomId
  form.remark = arranged.remark || ''
}

async function fetchPageData() {
  if (!queueId.value) {
    return
  }

  loading.value = true
  try {
    const [detailResult, counselors, rooms, slots] = await Promise.all([
      getConsultationArrangeDetail(queueId.value),
      getConsultationCounselorOptions(),
      getConsultationRoomOptions(),
      getConsultationTimeSlotOptions(),
    ])
    detail.value = detailResult
    counselorOptions.value = counselors
    roomOptions.value = rooms
    timeSlotOptions.value = slots
    fillFormFromArrangedInfo()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载咨询安排信息失败')
  } finally {
    loading.value = false
  }
}

function validateForm() {
  if (!form.counselorId) {
    message.warning('请选择咨询师')
    return false
  }
  if (!form.consultationDate) {
    message.warning('请选择咨询日期')
    return false
  }
  if (!form.slotId) {
    message.warning('请选择时间段')
    return false
  }
  if (!form.roomId) {
    message.warning('请选择咨询室')
    return false
  }
  return true
}

function handleBack() {
  router.push('/assistant/queue')
}

async function handleSubmit() {
  if (!queueId.value || !validateForm()) return

  submitting.value = true
  submitError.value = ''
  try {
    await arrangeFormalConsultation(queueId.value, {
      counselorId: form.counselorId,
      consultationDate: form.consultationDate,
      slotId: form.slotId,
      roomId: form.roomId,
      remark: form.remark,
    })
    message.success('正式咨询安排已生成')
    router.push('/assistant/queue')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '提交咨询安排失败'
    submitError.value = errorMessage
    message.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void fetchPageData()
})
</script>

<template>
  <div class="consultation-arrange-view">
    <PageHeader
      title="正式咨询安排"
      description="根据初访结果为学生安排单次正式咨询。"
    >
      <n-button @click="handleBack">返回队列</n-button>
    </PageHeader>

    <n-empty v-if="!queueId" description="请先从咨询队列中选择需要安排的学生">
      <template #extra>
        <n-button type="primary" @click="handleBack">前往咨询队列</n-button>
      </template>
    </n-empty>

    <n-spin v-else :show="loading">
      <n-empty v-if="!detail && !loading" description="队列记录不存在或已失效" />

      <template v-else-if="detail">
        <n-card title="学生与队列信息">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="学生姓名">{{ detail.studentName }}</n-descriptions-item>
            <n-descriptions-item label="学号">{{ detail.studentNo }}</n-descriptions-item>
            <n-descriptions-item label="院系">{{ detail.college || '-' }}</n-descriptions-item>
            <n-descriptions-item label="联系电话">{{ detail.phone || '-' }}</n-descriptions-item>
            <n-descriptions-item label="问题类型">{{ detail.problemTypeLabel }}</n-descriptions-item>
            <n-descriptions-item label="危机等级"><RiskTag :value="detail.crisisLevel" /></n-descriptions-item>
            <n-descriptions-item label="优先级分数">{{ detail.priorityScore }}</n-descriptions-item>
            <n-descriptions-item label="队列状态"><StatusTag :value="detail.status" type="queue" /></n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="初访摘要" style="margin-top: 16px">
          <n-descriptions bordered label-placement="left" :column="2">
            <n-descriptions-item label="初访时间">{{ detail.interviewTime }}</n-descriptions-item>
            <n-descriptions-item label="初访员">{{ detail.interviewerName || '-' }}</n-descriptions-item>
            <n-descriptions-item label="主要困扰">{{ detail.mainProblem }}</n-descriptions-item>
            <n-descriptions-item label="期望帮助">{{ detail.expectedHelp || '-' }}</n-descriptions-item>
            <n-descriptions-item label="问题描述" :span="2">{{ detail.problemDescription || '-' }}</n-descriptions-item>
            <n-descriptions-item label="初访摘要" :span="2">{{ detail.initialSummary || '-' }}</n-descriptions-item>
            <n-descriptions-item label="后续建议" :span="2">{{ detail.nextAction || '-' }}</n-descriptions-item>
            <n-descriptions-item label="初始风险分">{{ detail.initialRiskScore }}</n-descriptions-item>
            <n-descriptions-item label="风险信号">
              情绪 {{ detail.moodScore }}/10，睡眠 {{ detail.sleepScore }}/10，压力 {{ detail.stressScore }}/10
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

      </template>
    </n-spin>

    <section v-if="detail" class="arrange-card">
      <h2>安排表单</h2>

      <div class="form-grid">
        <label class="form-field">
          <span>咨询师 <em>*</em></span>
          <select v-model.number="form.counselorId">
            <option :value="0">请选择咨询师</option>
            <option v-for="option in counselorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>咨询日期 <em>*</em></span>
          <input v-model="form.consultationDate" type="date">
        </label>

        <label class="form-field">
          <span>时间段 <em>*</em></span>
          <select v-model.number="form.slotId">
            <option :value="0">请选择时间段</option>
            <option v-for="option in timeSlotOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="form-field">
          <span>咨询室 <em>*</em></span>
          <select v-model.number="form.roomId">
            <option :value="0">请选择咨询室</option>
            <option v-for="option in roomOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>

      <label class="form-field form-field--full">
        <span>备注</span>
        <textarea v-model="form.remark" rows="3" placeholder="可填写给咨询师的补充说明" />
      </label>

      <div class="preview-block">
        <span>安排预览</span>
        <div class="arrange-preview">
          {{ arrangePreview || '请选择咨询师、日期、时间段和咨询室后生成预览' }}
        </div>
      </div>

      <div v-if="submitError" class="submit-error">{{ submitError }}</div>

      <div class="form-actions">
        <button class="primary-button" type="button" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交安排' }}
        </button>
        <button class="secondary-button" type="button" @click="handleBack">取消</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.consultation-arrange-view {
  padding: 16px;
}

.arrange-card {
  margin-top: 16px;
  padding: 24px 28px;
  border-radius: 16px;
  background: #fff;
}

.arrange-card h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #1f2937;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #4b5563;
}

.form-field em {
  color: #d03050;
  font-style: normal;
}

.form-field select,
.form-field input,
.form-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 8px 11px;
  color: #1f2937;
  font: inherit;
  background: #fff;
}

.form-field textarea {
  resize: vertical;
}

.form-field--full {
  margin-top: 16px;
}

.preview-block {
  margin-top: 16px;
  color: #4b5563;
}

.arrange-preview {
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f7f9fc;
  color: #334155;
}

.submit-error {
  margin-top: 12px;
  border: 1px solid #f5c2c7;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff5f5;
  color: #c03221;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.primary-button,
.secondary-button {
  border: 0;
  border-radius: 8px;
  padding: 9px 18px;
  font: inherit;
  cursor: pointer;
}

.primary-button {
  background: #18a058;
  color: #fff;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.secondary-button {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #374151;
}
</style>
