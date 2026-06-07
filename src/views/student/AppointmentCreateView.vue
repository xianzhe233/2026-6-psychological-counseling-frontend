<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDatePicker, NButton, NSpace, NTag, NAlert, useMessage } from 'naive-ui'
import PageHeader from '@/components/common/PageHeader.vue'
import { getAvailableSlots, createAppointment } from '@/api/student'
import type { AvailableSlot, AppointmentCreateRequest } from '@/types/student'

const router = useRouter()
const message = useMessage()

const selectedDate = ref<number>(Date.now())
const availableSlots = ref<AvailableSlot[]>([])
const selectedSlot = ref<AvailableSlot | null>(null)
const loading = ref(false)
const submitting = ref(false)

const formattedDate = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toISOString().split('T')[0]
})

const disabledDate = (timestamp: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return timestamp < today.getTime()
}

async function fetchAvailableSlots() {
  loading.value = true
  try {
    const { data } = await getAvailableSlots(formattedDate.value)
    availableSlots.value = data.data
    selectedSlot.value = null
  } catch (error) {
    console.error('获取可预约时间段失败', error)
    message.error('获取可预约时间段失败')
  } finally {
    loading.value = false
  }
}

function selectSlot(slot: AvailableSlot) {
  if (slot.available) {
    selectedSlot.value = slot
  }
}

async function handleSubmit() {
  if (!selectedSlot.value) {
    message.error('请选择一个时间段')
    return
  }
  
  submitting.value = true
  try {
    const requestData: AppointmentCreateRequest = {
      formId: 0, // 需要从路由或状态获取
      dutyScheduleId: selectedSlot.value.dutyScheduleId,
      appointmentDate: selectedSlot.value.appointmentDate,
      slotId: selectedSlot.value.slotId,
      interviewerId: selectedSlot.value.interviewerId,
      roomId: selectedSlot.value.roomId
    }
    
    await createAppointment(requestData)
    message.success('预约成功')
    router.push('/student/appointments')
  } catch (error: any) {
    if (error?.response?.status === 409) {
      message.error('该时间段已被预约，请选择其他时间段')
    } else {
      message.error(error?.message || '预约失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAvailableSlots()
})
</script>

<template>
  <div class="appointment-create-view">
    <PageHeader title="初访预约" description="选择合适的时间段进行预约" />
    
    <n-card class="appointment-card">
      <div class="appointment-content">
        <div class="date-picker-section">
          <h3>选择日期</h3>
          <n-date-picker
            v-model:value="selectedDate"
            type="date"
            :is-date-disabled="disabledDate"
            @update:value="fetchAvailableSlots"
          />
        </div>
        
        <div class="slots-section">
          <h3>可预约时间段</h3>
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="availableSlots.length === 0" class="no-slots">
            暂无可用时间段
          </div>
          <div v-else class="slots-list">
            <div
              v-for="slot in availableSlots"
              :key="slot.dutyScheduleId"
              class="slot-item"
              :class="{
                'slot-available': slot.available,
                'slot-unavailable': !slot.available,
                'slot-selected': selectedSlot?.dutyScheduleId === slot.dutyScheduleId
              }"
              @click="selectSlot(slot)"
            >
              <div class="slot-info">
                <div class="slot-interviewer">{{ slot.interviewerName }}</div>
                <div class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</div>
                <div class="slot-room">{{ slot.roomName }}</div>
                <div class="slot-capacity">
                  剩余容量: {{ slot.remaining }}/{{ slot.capacity }}
                </div>
              </div>
              <div v-if="!slot.available" class="slot-reason">
                {{ slot.disabledReason }}
              </div>
              <div v-if="selectedSlot?.dutyScheduleId === slot.dutyScheduleId" class="slot-check">
                ✓
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedSlot" class="preview-section">
          <h3>预约预览</h3>
          <n-alert type="info">
            <template #header>
              预约信息确认
            </template>
            <p>初访员: {{ selectedSlot.interviewerName }}</p>
            <p>日期: {{ selectedSlot.appointmentDate }}</p>
            <p>时间: {{ selectedSlot.startTime }} - {{ selectedSlot.endTime }}</p>
            <p>咨询室: {{ selectedSlot.roomName }}</p>
          </n-alert>
          
          <div class="submit-section">
            <n-button
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交预约
            </n-button>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.appointment-create-view {
  padding: 24px;
}

.appointment-card {
  margin-top: 24px;
}

.appointment-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.date-picker-section,
.slots-section,
.preview-section {
  margin-bottom: 24px;
}

.date-picker-section h3,
.slots-section h3,
.preview-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.loading,
.no-slots {
  padding: 20px;
  text-align: center;
  color: #999;
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slot-item {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.slot-available {
  background-color: #f8fff8;
}

.slot-available:hover {
  border-color: #18a058;
}

.slot-unavailable {
  background-color: #fff8f8;
  cursor: not-allowed;
  opacity: 0.7;
}

.slot-selected {
  border-color: #18a058;
  background-color: #e8ffe8;
}

.slot-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.slot-interviewer {
  font-weight: bold;
}

.slot-time {
  color: #666;
}

.slot-room {
  color: #666;
}

.slot-capacity {
  color: #888;
}

.slot-reason {
  margin-top: 8px;
  color: #d03050;
  font-size: 12px;
}

.slot-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #18a058;
  font-weight: bold;
}

.submit-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>