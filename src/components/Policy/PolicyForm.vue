<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ServiceEnum } from '@/interfaces/Common'
import type { InsurancePlan } from '@/interfaces/Insurance'

// Props
interface Props {
  userId?: string
  bookingId?: string
  service?: ServiceEnum | null
  selectedPlanIds?: string[]
  availablePlans?: InsurancePlan[]
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userId: '',
  bookingId: '',
  service: null,
  selectedPlanIds: () => [],
  availablePlans: () => [],
  isEdit: false
})

// Emits
const emit = defineEmits<{
  (e: 'update:userId', value: string): void
  (e: 'update:bookingId', value: string): void
  (e: 'update:service', value: ServiceEnum | null): void
  (e: 'update:selectedPlanIds', value: string[]): void
}>()

// Local state for v-model
const localUserId = ref(props.userId)
const localBookingId = ref(props.bookingId)
const localService = ref<ServiceEnum | null>(props.service)
const localSelectedPlanIds = ref<string[]>([...props.selectedPlanIds])

// Service options for dropdown
const serviceOptions = [
  { value: ServiceEnum.ACCOMMODATION, label: 'Accommodation' },
  { value: ServiceEnum.FLIGHT, label: 'Flight' },
  { value: ServiceEnum.PACKAGE, label: 'Package' },
  { value: ServiceEnum.RENTAL, label: 'Rental' }
]

// Filtered insurance plans based on selected service
const filteredPlans = computed(() => {
  if (!localService.value) {
    return []
  }
  return props.availablePlans.filter((plan) =>
    plan.applicableService.includes(localService.value as ServiceEnum)
  )
})

// Watch for changes and emit to parent
watch(localUserId, (newValue) => {
  emit('update:userId', newValue)
})

watch(localBookingId, (newValue) => {
  emit('update:bookingId', newValue)
})

watch(localService, (newValue) => {
  emit('update:service', newValue)
  // Clear selected plans when service changes
  localSelectedPlanIds.value = []
  emit('update:selectedPlanIds', [])
})

watch(
  localSelectedPlanIds,
  (newValue) => {
    emit('update:selectedPlanIds', newValue)
  },
  { deep: true }
)

// Handle checkbox toggle
const togglePlan = (planId: string) => {
  const index = localSelectedPlanIds.value.indexOf(planId)
  if (index > -1) {
    localSelectedPlanIds.value.splice(index, 1)
  } else {
    localSelectedPlanIds.value.push(planId)
  }
}

// Handle remove plan
const removePlan = (planId: string) => {
  const index = localSelectedPlanIds.value.indexOf(planId)
  if (index > -1) {
    localSelectedPlanIds.value.splice(index, 1)
  }
}

// Check if plan is selected
const isPlanSelected = (planId: string) => {
  return localSelectedPlanIds.value.includes(planId)
}

// Get selected plans details
const selectedPlansDetails = computed(() => {
  return props.availablePlans.filter((plan) => localSelectedPlanIds.value.includes(plan.id))
})

// Calculate total price
const totalPrice = computed(() => {
  return selectedPlansDetails.value.reduce((sum, plan) => sum + plan.price, 0)
})

// Calculate total coverage
const totalCoverage = computed(() => {
  return selectedPlansDetails.value.reduce((sum, plan) => sum + plan.coverage, 0)
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}
</script>

<template>
  <div class="space-y-6">
    <!-- User ID and Booking ID -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- User ID -->
      <div>
        <label for="userId" class="block text-sm font-medium text-gray-700 mb-2">
          User ID <span class="text-red-500">*</span>
        </label>
        <input
          id="userId"
          v-model="localUserId"
          type="text"
          placeholder="Enter user ID"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          :disabled="isEdit"
          required
        />
      </div>

      <!-- Booking ID -->
      <div>
        <label for="bookingId" class="block text-sm font-medium text-gray-700 mb-2">
          Booking ID <span class="text-red-500">*</span>
        </label>
        <input
          id="bookingId"
          v-model="localBookingId"
          type="text"
          placeholder="Enter booking ID"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          :disabled="isEdit"
          required
        />
      </div>
    </div>

    <!-- Service Dropdown -->
    <div>
      <label for="service" class="block text-sm font-medium text-gray-700 mb-2">
        Service <span class="text-red-500">*</span>
      </label>
      <select
        id="service"
        v-model="localService"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        :disabled="isEdit"
        required
      >
        <option :value="null" disabled>Select a service</option>
        <option v-for="option in serviceOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p class="text-sm text-gray-500 mt-1">Select a service to see available insurance plans</p>
    </div>

    <!-- Insurance Plans Section -->
    <div v-if="localService">
      <div class="flex items-center justify-between mb-3">
        <label class="block text-sm font-medium text-gray-700">
          Insurance Plans <span class="text-red-500">*</span>
        </label>
        <button
          v-if="filteredPlans.length > 0"
          type="button"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          @click="
            localSelectedPlanIds = filteredPlans.every((p) => isPlanSelected(p.id))
              ? []
              : filteredPlans.map((p) => p.id)
          "
        >
          {{
            filteredPlans.every((p) => isPlanSelected(p.id)) ? 'Deselect All' : 'Select All'
          }}
        </button>
      </div>

      <!-- No Plans Available -->
      <div
        v-if="filteredPlans.length === 0"
        class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-gray-600 font-medium">No insurance plans selected</p>
        <p class="text-gray-500 text-sm mt-1">
          Please select a service first to see available insurance plans
        </p>
      </div>

      <!-- Available Plans List -->
      <div v-else class="space-y-3">
        <div
          v-for="plan in filteredPlans"
          :key="plan.id"
          class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50': isPlanSelected(plan.id) }"
          @click="togglePlan(plan.id)"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="isPlanSelected(plan.id)"
              class="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              @click.stop="togglePlan(plan.id)"
            />
            <div class="flex-1">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ plan.planName }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ plan.coverageDetails }}</p>
                </div>
                <div class="text-right ml-4">
                  <p class="font-bold text-blue-600">{{ formatCurrency(plan.price) }}</p>
                  <p class="text-sm text-gray-500">Coverage: {{ formatCurrency(plan.coverage) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Plans Summary -->
      <div v-if="selectedPlansDetails.length > 0" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3">Selected Insurance Plans</h4>
        <div class="space-y-2">
          <div
            v-for="plan in selectedPlansDetails"
            :key="plan.id"
            class="flex items-center justify-between bg-white rounded-lg p-3"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ plan.planName }}</p>
              <p class="text-sm text-gray-600">{{ formatCurrency(plan.price) }}</p>
            </div>
            <button
              type="button"
              class="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
              @click="removePlan(plan.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Total Summary -->
        <div class="mt-4 pt-4 border-t border-blue-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600">Total Plans Selected</p>
              <p class="text-2xl font-bold text-gray-900">{{ selectedPlansDetails.length }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total Price</p>
              <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalPrice) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total Coverage</p>
              <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalCoverage) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
input,
select {
  transition: all 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
}

/* Disabled input styling */
input:disabled,
select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
