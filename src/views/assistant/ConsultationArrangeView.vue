<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NSpin,
  useMessage,
} from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import ArrangementPreviewCard from '@/components/assistant/ArrangementPreviewCard.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import RiskTag from '@/components/common/RiskTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ActionBar from '@/components/ui/ActionBar.vue'
import ConflictAlert from '@/components/ui/ConflictAlert.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import FormSection from '@/components/ui/FormSection.vue'
import InfoDescriptions from '@/components/ui/InfoDescriptions.vue'
import PageContainer from '@/components/ui/PageContainer.vue'
import PriorityBadge from '@/components/ui/PriorityBadge.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { extractApiErrorMessage } from '@/utils/api-error'
import {
  arrangeFormalConsultation,
  getConsultationArrangeDetail,
  getConsultationCounselorOptions,
  getConsultationQueueOptions,
  getConsultationRoomOptions,
  getConsultationTimeSlotOptions,
} from '@/api/assistant'
import type { ArrangeConsultationRequest, ConsultationArrangeDetailVO } from '@/api/assistant'
import type { OptionItem } from '@/api/admin'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const queueId = computed(() => Number(route.params.id || selectedQueueId.value || 0))
const loading = ref(false)
const submitting = ref(false)
const submitError = ref('')
const detail = ref<ConsultationArrangeDetailVO | null>(null)
const queueOptions = ref<OptionItem[]>([])
const counselorOptions = ref<OptionItem[]>([])
const roomOptions = ref<OptionItem[]>([])
const timeSlotOptions = ref<OptionItem[]>([])

const form = reactive<ArrangeConsultationRequest>({
  queueId: 0,
  studentId: 0,
  counselorId: 0,
  consultationDate: '',
  slotId: 0,
  roomId: 0,
  remark: '',
})
const selectedQueueId = ref<number | null>(Number(route.params.id || 0) || null)

const selectedCounselor = computed(() => counselorOptions.value.find(item => item.value === form.counselorId))
const selectedRoom = computed(() => roomOptions.value.find(item => item.value === form.roomId))
const selectedSlot = computed(() => timeSlotOptions.value.find(item => item.value === form.slotId))

const arrangePreview = computed(() => {
  if (!detail.value || !selectedCounselor.value || !selectedRoom.value || !selectedSlot.value || !form.consultationDate) {
    return ''
  }
  return `${detail.value.studentName} 将于 ${form.consultationDate} ${selectedSlot.value.label} 在 ${selectedRoom.value.label} 接受 ${selectedCounselor.value.label} 的正式咨询`
})

function resetForm() {
  form.queueId = queueId.value
  form.studentId = detail.value?.studentId ?? 0
  form.counselorId = 0
  form.consultationDate = ''
  form.slotId = 0
  form.roomId = 0
  form.remark = ''
}

function fillFormFromArrangedInfo() {
  resetForm()
  const schedules = detail.value?.schedules
  if (!schedules || schedules.length === 0) return
  const arranged = schedules[0]

  form.counselorId = arranged.counselorId
  form.consultationDate = arranged.consultationDate
  form.slotId = arranged.slotId
  form.roomId = arranged.roomId
  form.remark = ''
}

async function fetchBaseOptions() {
  try {
    const [queues, counselors, rooms, slots] = await Promise.all([
      getConsultationQueueOptions(),
      getConsultationCounselorOptions(),
      getConsultationRoomOptions(),
      getConsultationTimeSlotOptions(),
    ])
    queueOptions.value = queues
    counselorOptions.value = counselors
    roomOptions.value = rooms
    timeSlotOptions.value = slots
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载基础选项失败')
  }
}

async function fetchDetail() {
  detail.value = null
  resetForm()

  if (!queueId.value) {
    return
  }

  loading.value = true
  submitError.value = ''
  try {
    detail.value = await getConsultationArrangeDetail(queueId.value)
    fillFormFromArrangedInfo()
  } catch (error) {
    detail.value = null
    resetForm()
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

function handleQueueChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value || 0)
  selectedQueueId.value = value || null
  detail.value = null
  resetForm()
  submitError.value = ''
  if (value) {
    router.replace(`/assistant/queue/${value}/arrange`)
  } else {
    router.replace('/assistant/arrange')
  }
}

function handleBack() {
  router.push('/assistant/queue')
}

async function handleSubmit() {
  if (!queueId.value || !validateForm()) return

  submitting.value = true
  submitError.value = ''
  try {
    await arrangeFormalConsultation({
      queueId: queueId.value,
      studentId: detail.value!.studentId,
      counselorId: form.counselorId,
      consultationDate: form.consultationDate,
      slotId: form.slotId,
      roomId: form.roomId,
      remark: form.remark,
    })
    message.success('正式咨询安排已生成')
    router.push('/assistant/queue')
  } catch (error) {
    const errorMessage = extractApiErrorMessage(error, '提交咨询安排失败')
    submitError.value = errorMessage
    message.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

watch(
  () => route.params.id,
  (value) => {
    const nextId = Number(value || 0)
    selectedQueueId.value = nextId || null
    void fetchDetail()
  },
)

onMounted(async () => {
  await fetchBaseOptions()
  await fetchDetail()
})
</script>

<template>
  <PageContainer class="consultation-arrange-view bp-page bp-section-gap">
    <PageHeader
      title="正式咨询安排"
      description="根据初访结果为学生安排单次正式咨询。"
    >
      <n-button @click="handleBack">返回队列</n-button>
    </PageHeader>

    <SectionCard title="选择队列记录">
      <FormField label="待安排学生">
        <select
          class="bp-form-control"
          :value="selectedQueueId ?? 0"
          @change="handleQueueChange"
        >
          <option :value="0">请先选择队列记录</option>
          <option v-for="option in queueOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </FormField>
    </SectionCard>

    <EmptyState
      v-if="!queueId"
      title="请选择队列记录"
      description="请从上方选择需要安排的队列记录，或从咨询队列页点击「安排」进入"
      action-text="前往咨询队列"
      @action="handleBack"
    />

    <n-spin v-else :show="loading">
      <EmptyState
        v-if="!detail && !loading"
        title="记录不可用"
        description="队列记录不存在或已失效，请返回队列重新选择"
      />

      <div v-else-if="detail" class="bp-section-gap">
        <SectionCard title="学生与队列信息">
          <InfoDescriptions
            :items="[
              { label: '学生姓名', value: detail.studentName },
              { label: '学号', value: detail.studentNo },
              { label: '院系', value: detail.college || '—' },
              { label: '联系电话', value: detail.phone || '—' },
              { label: '问题类型', value: detail.problemTypeName },
              { label: '危机等级', value: detail.crisisLevel },
              { label: '优先级', value: String(detail.priorityScore) },
              { label: '队列状态', value: detail.queueStatus },
            ]"
          >
            <template #value-5>
              <RiskTag :value="detail.crisisLevel" show-icon />
            </template>
            <template #value-6>
              <PriorityBadge :score="detail.priorityScore" show-bar />
            </template>
            <template #value-7>
              <StatusTag :value="detail.queueStatus" type="queue" />
            </template>
          </InfoDescriptions>
        </SectionCard>

        <SectionCard title="初访摘要">
          <InfoDescriptions
            :items="[
              { label: '初访时间', value: detail.interviewTime },
              { label: '初访员', value: detail.interviewerName || '—' },
              { label: '主要困扰', value: detail.mainProblem },
              { label: '期望帮助', value: detail.expectedHelp || '—' },
              { label: '问题描述', value: detail.problemDescription || '—', span: 2 },
              { label: '初访摘要', value: detail.summary || '—', span: 2 },
              { label: '后续建议', value: detail.nextAction || '—', span: 2 },
              { label: '风险分', value: String(detail.riskScore) },
              { label: '风险等级', value: detail.riskLevel },
            ]"
          >
            <template #value-9>
              <RiskTag :value="detail.riskLevel" show-icon />
            </template>
          </InfoDescriptions>
        </SectionCard>

        <SectionCard title="安排表单">
          <FormSection title="时间与地点">
            <div class="bp-form-grid">
              <FormField label="咨询师" required>
                <select v-model.number="form.counselorId" class="bp-form-control">
                  <option :value="0">请选择咨询师</option>
                  <option v-for="option in counselorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </FormField>

              <FormField label="咨询日期" required>
                <input v-model="form.consultationDate" class="bp-form-control" type="date">
              </FormField>

              <FormField label="时间段" required>
                <select v-model.number="form.slotId" class="bp-form-control">
                  <option :value="0">请选择时间段</option>
                  <option v-for="option in timeSlotOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </FormField>

              <FormField label="咨询室" required>
                <select v-model.number="form.roomId" class="bp-form-control">
                  <option :value="0">请选择咨询室</option>
                  <option v-for="option in roomOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormField label="备注" hint="可填写给咨询师的补充说明">
            <textarea
              v-model="form.remark"
              class="bp-form-control"
              rows="3"
              placeholder="例如：学生希望优先安排女性咨询师"
            />
          </FormField>

          <ArrangementPreviewCard :preview="arrangePreview" />

          <ConflictAlert
            :message="submitError"
            type="error"
            title="安排失败"
          />

          <ActionBar :sticky="false">
            <n-button @click="handleBack">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmit">提交安排</n-button>
          </ActionBar>
        </SectionCard>
      </div>
    </n-spin>
  </PageContainer>
</template>
