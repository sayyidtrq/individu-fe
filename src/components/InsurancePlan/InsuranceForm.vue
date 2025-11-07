<script setup lang="ts">
import { ref, watch } from 'vue'
import { ServiceEnum } from '@/interfaces/Common'
import type { CreateInsurancePlanDTO } from '@/interfaces/Insurance'

interface Props {
  initialData?: Partial<CreateInsurancePlanDTO>
  isEdit?: boolean
  insurancePlanId?: string
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  insurancePlanId: ''
})

const emit = defineEmits<{
  submit: [data: CreateInsurancePlanDTO]
  cancel: []
}>()

// Form data
const formData = ref<CreateInsurancePlanDTO>({
  providerId: '',
  planName: '',
  price: 0,
  coverage: 0,
  coverageDetails: '',
  applicableService: [],
  expiredByDays: 1
})

// Service checkboxes state
const selectedServices = ref<{ [key in ServiceEnum]: boolean }>({
  [ServiceEnum.ACCOMMODATION]: false,
  [ServiceEnum.FLIGHT]: false,
  [ServiceEnum.PACKAGE]: false,
  [ServiceEnum.RENTAL]: false
})

// Initialize form with initial data if provided
if (props.initialData) {
  formData.value = { ...formData.value, ...props.initialData }
  // Set checkboxes based on initial data
  if (props.initialData.applicableService) {
    props.initialData.applicableService.forEach((service) => {
      selectedServices.value[service] = true
    })
  }
}

// Watch selected services and update formData
watch(
  selectedServices,
  (newVal) => {
    formData.value.applicableService = Object.entries(newVal)
      .filter(([_, isSelected]) => isSelected)
      .map(([service, _]) => service as ServiceEnum)
  },
  { deep: true }
)

// Validation
const errors = ref<{ [key: string]: string }>({})

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.providerId.trim()) {
    errors.value.providerId = 'Provider ID is required'
  }

  if (!formData.value.planName.trim()) {
    errors.value.planName = 'Plan Name is required'
  }

  if (formData.value.price <= 0) {
    errors.value.price = 'Price must be greater than 0'
  }

  if (formData.value.coverage <= 0) {
    errors.value.coverage = 'Coverage must be greater than 0'
  }

  if (!formData.value.coverageDetails.trim()) {
    errors.value.coverageDetails = 'Coverage Details are required'
  }

  if (formData.value.applicableService.length === 0) {
    errors.value.applicableService = 'At least one service must be selected'
  }

  if (formData.value.expiredByDays < 1) {
    errors.value.expiredByDays = 'Expired By Days must be at least 1'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', formData.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Insurance Plan ID (only shown when editing) -->
    <div v-if="isEdit && insurancePlanId" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="insurancePlanId" class="block text-sm font-medium text-gray-700 mb-2">
          Insurance Plan ID <span class="text-red-500">*</span>
        </label>
        <input
          id="insurancePlanId"
          :value="insurancePlanId"
          type="text"
          disabled
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700 font-mono"
        />
        <p class="mt-1 text-sm text-gray-500">Insurance Plan ID cannot be changed</p>
      </div>
    </div>

    <!-- Provider ID and Plan Name -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Provider ID -->
      <div>
        <label for="providerId" class="block text-sm font-medium text-gray-700 mb-2">
          Provider ID <span class="text-red-500">*</span>
        </label>
        <input
          id="providerId"
          v-model="formData.providerId"
          type="text"
          placeholder="Enter provider ID"
          :disabled="isEdit"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors.providerId ? 'border-red-500' : 'border-gray-300',
            isEdit ? 'bg-gray-100 cursor-not-allowed' : ''
          ]"
        />
        <p v-if="errors.providerId" class="mt-1 text-sm text-red-500">{{ errors.providerId }}</p>
        <p v-if="isEdit" class="mt-1 text-sm text-gray-500">Provider ID cannot be changed</p>
      </div>

      <!-- Plan Name -->
      <div>
        <label for="planName" class="block text-sm font-medium text-gray-700 mb-2">
          Plan Name <span class="text-red-500">*</span>
        </label>
        <input
          id="planName"
          v-model="formData.planName"
          type="text"
          placeholder="Enter plan name"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors.planName ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.planName" class="mt-1 text-sm text-red-500">{{ errors.planName }}</p>
      </div>
    </div>

    <!-- Price and Coverage -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
          Price (IDR) <span class="text-red-500">*</span>
        </label>
        <input
          id="price"
          v-model.number="formData.price"
          type="number"
          min="0"
          placeholder="0"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors.price ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.price" class="mt-1 text-sm text-red-500">{{ errors.price }}</p>
      </div>

      <!-- Coverage -->
      <div>
        <label for="coverage" class="block text-sm font-medium text-gray-700 mb-2">
          Coverage (IDR) <span class="text-red-500">*</span>
        </label>
        <input
          id="coverage"
          v-model.number="formData.coverage"
          type="number"
          min="0"
          placeholder="0"
          :class="[
            'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
            errors.coverage ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.coverage" class="mt-1 text-sm text-red-500">{{ errors.coverage }}</p>
      </div>
    </div>

    <!-- Coverage Details -->
    <div>
      <label for="coverageDetails" class="block text-sm font-medium text-gray-700 mb-2">
        Coverage Details <span class="text-red-500">*</span>
      </label>
      <textarea
        id="coverageDetails"
        v-model="formData.coverageDetails"
        rows="4"
        placeholder="Describe what this insurance plan covers..."
        :class="[
          'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none',
          errors.coverageDetails ? 'border-red-500' : 'border-gray-300'
        ]"
      />
      <p v-if="errors.coverageDetails" class="mt-1 text-sm text-red-500">{{ errors.coverageDetails }}</p>
    </div>

    <!-- Expired By Days -->
    <div>
      <label for="expiredByDays" class="block text-sm font-medium text-gray-700 mb-2">
        Expired By Days <span class="text-red-500">*</span>
      </label>
      <input
        id="expiredByDays"
        v-model.number="formData.expiredByDays"
        type="number"
        min="1"
        placeholder="1"
        :class="[
          'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
          errors.expiredByDays ? 'border-red-500' : 'border-gray-300'
        ]"
      />
      <p v-if="errors.expiredByDays" class="mt-1 text-sm text-red-500">{{ errors.expiredByDays }}</p>
    </div>

    <!-- Applicable Services -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Applicable Services <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <label
          v-for="service in Object.values(ServiceEnum)"
          :key="service"
          class="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            v-model="selectedServices[service]"
            type="checkbox"
            :value="service"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">{{ service }}</span>
        </label>
      </div>
      <p v-if="errors.applicableService" class="mt-2 text-sm text-red-500">{{ errors.applicableService }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end gap-3 pt-4">
      <button
        type="button"
        @click="handleCancel"
        class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {{ isEdit ? 'Update Insurance Plan' : 'Create Insurance Plan' }}
      </button>
    </div>
  </form>
</template>
