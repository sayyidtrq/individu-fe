<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import InsuranceForm from '@/components/InsurancePlan/InsuranceForm.vue'
import type { CreateInsurancePlanDTO, InsurancePlan } from '@/interfaces/Insurance'
import { getInsurancePlanById, insurancePlanService } from '@/services/insurancePlan'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const isFetching = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const insurancePlan = ref<InsurancePlan | null>(null)

// Fetch existing insurance plan data
const fetchInsurancePlan = async () => {
  try {
    isFetching.value = true
    errorMessage.value = ''
    
    const id = route.params.id as string
    const response = await getInsurancePlanById(id)
    
    if (response.status === 200 && response.data) {
      insurancePlan.value = response.data
    } else {
      errorMessage.value = response.message || 'Failed to load insurance plan'
    }
  } catch (error: any) {
    console.error('Error fetching insurance plan:', error)
    errorMessage.value = error.response?.data?.message || 'An error occurred while loading the insurance plan'
  } finally {
    isFetching.value = false
  }
}

const handleSubmit = async (data: CreateInsurancePlanDTO) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const id = route.params.id as string
    
    // Update insurance plan (excluding id and providerId which cannot be changed)
    const updateData = {
      planName: data.planName,
      price: data.price,
      coverage: data.coverage,
      coverageDetails: data.coverageDetails,
      applicableService: data.applicableService,
      expiredByDays: data.expiredByDays
    }
    
    const updatedPlan = await insurancePlanService.updateInsurancePlan(id, updateData)

    if (updatedPlan) {
      successMessage.value = 'Insurance plan updated successfully!'
      
      // Navigate to detail page after 1.5 seconds
      setTimeout(() => {
        router.push(`/insurance-plan/${id}`)
      }, 1500)
    } else {
      errorMessage.value = 'Failed to update insurance plan'
    }
  } catch (error: any) {
    console.error('Error updating insurance plan:', error)
    errorMessage.value = error.response?.data?.message || 'An error occurred while updating the insurance plan'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  router.push(`/insurance-plan/${route.params.id}`)
}

onMounted(() => {
  fetchInsurancePlan()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State while fetching -->
      <div v-if="isFetching" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg
            class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
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
          <p class="text-gray-700 font-medium">Loading insurance plan...</p>
        </div>
      </div>

      <!-- Error State while fetching -->
      <div v-else-if="errorMessage && !insurancePlan" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Insurance Plan</h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <button
          @click="router.push('/insurance-plan')"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Insurance Plans
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="insurancePlan">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="handleCancel"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Details
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Update Insurance Plan</h1>
          <p class="mt-2 text-gray-600">Update existing insurance plan in the system</p>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start"
        >
          <svg class="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            <p class="text-sm text-green-600 mt-1">Redirecting to insurance plan details...</p>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage && insurancePlan"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
        >
          <svg class="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
        </div>

        <!-- Info Notice -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-800">Update Restrictions</p>
            <p class="text-sm text-blue-600 mt-1">Insurance Plan ID and Provider ID cannot be changed</p>
          </div>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <InsuranceForm
            :initial-data="{
              providerId: insurancePlan.providerId,
              planName: insurancePlan.planName,
              price: insurancePlan.price,
              coverage: insurancePlan.coverage,
              coverageDetails: insurancePlan.coverageDetails,
              applicableService: insurancePlan.applicableService,
              expiredByDays: insurancePlan.expiredByDays
            }"
            :insurance-plan-id="insurancePlan.id"
            :is-edit="true"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
          />
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 flex flex-col items-center">
          <svg
            class="animate-spin h-12 w-12 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
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
          <p class="text-gray-700 font-medium">Updating insurance plan...</p>
        </div>
      </div>
    </div>
  </div>
</template>
