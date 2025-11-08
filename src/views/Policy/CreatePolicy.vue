<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PolicyForm from '@/components/Policy/PolicyForm.vue'
import { policyService } from '@/store/policy'
import { insurancePlanService } from '@/store/insurancePlan'
import type { ServiceEnum } from '@/interfaces/Common'
import type { InsurancePlan } from '@/interfaces/Insurance'
import type { CreatePolicyDTO } from '@/interfaces/Policy'

const router = useRouter()

// Form data
const userId = ref('')
const bookingId = ref('')
const service = ref<ServiceEnum | null>(null)
const selectedPlanIds = ref<string[]>([])

// State
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const allInsurancePlans = ref<InsurancePlan[]>([])

// Fetch all insurance plans
const fetchInsurancePlans = async () => {
  try {
    loading.value = true
    error.value = null
    const plans = await insurancePlanService.getAllInsurancePlans()
    allInsurancePlans.value = plans
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load insurance plans'
    console.error('Error fetching insurance plans:', err)
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = async () => {
  // Validation
  if (!userId.value.trim()) {
    error.value = 'User ID is required'
    return
  }

  if (!bookingId.value.trim()) {
    error.value = 'Booking ID is required'
    return
  }

  if (!service.value) {
    error.value = 'Service is required'
    return
  }

  if (selectedPlanIds.value.length === 0) {
    error.value = 'Please select at least one insurance plan'
    return
  }

  try {
    submitting.value = true
    error.value = null

    const createPolicyDTO: CreatePolicyDTO = {
      userId: userId.value,
      bookingId: bookingId.value,
      service: service.value,
      insurancePlanIds: selectedPlanIds.value
    }

    const response = await policyService.createPolicy(createPolicyDTO)

    if (response.status === 200 || response.status === 201) {
      // Success - redirect to policy list or detail page
      router.push('/policy')
    } else {
      error.value = response.message || 'Failed to create policy'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create policy'
    console.error('Error creating policy:', err)
  } finally {
    submitting.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  router.push('/policy')
}

onMounted(() => {
  fetchInsurancePlans()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Create Policy</h1>
        <p class="text-gray-600 mt-2">Add a new policy to the system</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Form Card -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- Error Alert -->
        <div
          v-if="error"
          class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3"
        >
          <svg class="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="flex-1">
            <p class="font-medium">{{ error }}</p>
          </div>
          <button @click="error = null" class="text-red-700 hover:text-red-800">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit">
          <PolicyForm
            v-model:user-id="userId"
            v-model:booking-id="bookingId"
            v-model:service="service"
            v-model:selected-plan-ids="selectedPlanIds"
            :available-plans="allInsurancePlans"
          />

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              @click="handleCancel"
              :disabled="submitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="submitting"
            >
              <svg
                v-if="submitting"
                class="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ submitting ? 'Creating...' : 'Create Policy' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here */
</style>
