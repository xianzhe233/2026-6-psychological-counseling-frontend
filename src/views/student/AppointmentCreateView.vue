<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NCard, NDatePicker, NButton, NSpace, NText, NIcon, NTag, NDivider } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getAvailableSlots, createAppointment } from '@/api/student'
import type { AvailableSlot } from '@/types/student'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const formId = computed(() => {
  const rawValue = Array.isArray(route.query.formId) ? route.query.formId[0] : route.query.formId
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})

const selectedDate = ref<number | null>(null)
const availableSlots = ref<AvailableSlot[]>([])
const loadingSlots = ref(false)
const selectedSlot = ref<AvailableSlot | null>(null)
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

const dateValue = computed(() => {
  if (!selectedDate.value) return null
  return dayjs(selectedDate.value).format('YYYY-MM-DD')
})

const isDateDisabled = (timestamp: number) => {
  return dayjs(timestamp).isBefore(dayjs().startOf('day'))
}

const handleDateChange = async (value: number | null) => {
  selectedDate.value = value
  selectedSlot.value = null
  errorMessage.value = null
  
  if (!value) {
    availableSlots.value = []
    return
  }
  
  loadingSlots.value = true
  try {
    const dateStr = dayjs(value).format('YYYY-MM-DD')
    const response = await getAvailableSlots(dateStr)
    availableSlots.value = response.data.data || []
  } catch (error: any) {
    console.error('获取可预约时间段失败:', error)
    errorMessage.value = error.response?.data?.message || '获取可预约时间段失败，请稍后重试'
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

const handleSelectSlot = (slot: AvailableSlot) => {
  if (!slot.available) return
  selectedSlot.value = slot
  errorMessage.value = null
}

const handleSubmit = async () => {
  if (!formId.value) {
    errorMessage.value = '缺少首访登记表信息，请先完成首访登记'
    return
  }
  
  if (!selectedSlot.value) {
    errorMessage.value = '请选择一个可预约的时间段'
    return
  }
  
  submitting.value = true
  errorMessage.value = null
  
  try {
    await createAppointment({
      formId: formId.value,
      dutyScheduleId: selectedSlot.value.dutyScheduleId,
      appointmentDate: selectedSlot.value.appointmentDate,
      slotId: selectedSlot.value.slotId,
      interviewerId: selectedSlot.value.interviewerId,
      roomId: selectedSlot.value.roomId || 0
    })
    
    router.push('/student/appointments')
  } catch (error: any) {
    console.error('提交预约失败:', error)
    errorMessage.value = error.response?.data?.message || '提交预约失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="appointment-create-view">
    <PageHeader title="初访预约" description="选择合适的时间段进行预约" />
    
    <n-card class="appointment-card">
      <template #header>
        <n-text strong>预约说明</n-text>
      </template>
      <n-alert v-if="formId" type="success" class="appointment-alert">
        已接收首访登记表编号 {{ formId }}，后续可直接基于该编号完成可预约时段查询与预约提交。
      </n-alert>
      <n-alert v-else type="warning" class="appointment-alert">
        当前未携带 formId。正式联调时应从“知情同意书”页面完成签署后进入此页。
      </n-alert>
      
      <div class="appointment-info">
        <p>1. 预约提交后，管理员将进行审核，请保持手机畅通。</p>
        <p>2. 如需撤销预约，请至少提前一天在"我的预约"页面操作。</p>
        <p>3. 请如实填写首访登记表，信息仅用于心理咨询服务。</p>
      </div>
    </n-card>
    
    <n-card class="appointment-card" title="选择预约日期">
      <n-date-picker
        v-model:value="selectedDate"
        type="date"
        :is-date-disabled="isDateDisabled"
        clearable
        @update:value="handleDateChange"
      />
      <n-text v-if="dateValue" class="selected-date-text">
        已选择日期：{{ dateValue }}
      </n-text>
    </n-card>
    
    <n-card v-if="selectedDate" class="appointment-card" title="可预约时间段">
      <n-spin :show="loadingSlots">
        <div v-if="availableSlots.length === 0 && !loadingSlots" class="empty-slots">
          <n-text depth="3">当前日期暂无可用时间段，请选择其他日期。</n-text>
        </div>
        
        <div v-else class="slots-grid">
          <div
            v-for="slot in availableSlots"
            :key="slot.dutyScheduleId"
            :class="[
              'slot-item',
              {
                'slot-item-selected': selectedSlot?.dutyScheduleId === slot.dutyScheduleId,
                'slot-item-disabled': !slot.available
              }
            ]"
            @click="handleSelectSlot(slot)"
          >
            <div class="slot-header">
              <n-text strong>{{ slot.interviewerName }}</n-text>
              <n-tag :type="slot.available ? 'success' : 'error'" size="small">
                {{ slot.available ? '可预约' : '不可用' }}
              </n-tag>
            </div>
            
            <div class="slot-time">
              <n-text>{{ slot.startTime }} - {{ slot.endTime }}</n-text>
            </div>
            
            <div class="slot-info">
              <n-text depth="3">咨询室：{{ slot.roomName || '未分配' }}</n-text>
              <n-text depth="3">剩余容量：{{ slot.remaining }}</n-text>
            </div>
            
            <div v-if="!slot.available && slot.disabledReason" class="slot-reason">
              <n-text type="error" depth="3">{{ slot.disabledReason }}</n-text>
            </div>
          </div>
        </div>
      </n-spin>
    </n-card>
    
    <n-card v-if="selectedSlot" class="appointment-card" title="预约预览">
      <div class="preview-content">
        <div class="preview-item">
          <n-text strong>初访员：</n-text>
          <n-text>{{ selectedSlot.interviewerName }}</n-text>
        </div>
        <div class="preview-item">
          <n-text strong>预约日期：</n-text>
          <n-text>{{ selectedSlot.appointmentDate }}</n-text>
        </div>
        <div class="preview-item">
          <n-text strong>时间段：</n-text>
          <n-text>{{ selectedSlot.startTime }} - {{ selectedSlot.endTime }}</n-text>
        </div>
        <div class="preview-item">
          <n-text strong>咨询室：</n-text>
          <n-text>{{ selectedSlot.roomName || '未分配' }}</n-text>
        </div>
      </div>
    </n-card>
    
    <n-alert v-if="errorMessage" type="error" class="appointment-alert">
      {{ errorMessage }}
    </n-alert>
    
    <div class="appointment-actions">
      <n-space>
        <n-button @click="router.back()">返回</n-button>
        <n-button
          type="primary"
          :disabled="!selectedSlot || !formId"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交预约
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<style scoped>
.appointment-create-view {
  padding: 24px;
}

.appointment-card {
  margin-top: 24px;
}

.appointment-alert {
  margin-bottom: 16px;
}

.appointment-info {
  margin-top: 16px;
}

.appointment-info p {
  margin: 8px 0;
  color: #666;
}

.selected-date-text {
  display: block;
  margin-top: 12px;
}

.empty-slots {
  text-align: center;
  padding: 40px 0;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.slot-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slot-item:hover:not(.slot-item-disabled) {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.slot-item-selected {
  border-color: #18a058;
  background-color: #f8fff8;
}

.slot-item-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slot-time {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.slot-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.slot-reason {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.preview-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.preview-item {
  display: flex;
  gap: 8px;
}

.appointment-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
