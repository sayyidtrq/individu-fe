<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InsuranceForm from '@/components/InsurancePlan/InsuranceForm.vue'
import type { CreateInsurancePlanDTO } from '@/interfaces/Insurance'
import { createInsurancePlan } from '@/services/insurancePlan'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSubmit = async (data: CreateInsurancePlanDTO) => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const response = await createInsurancePlan(data)

    if (response.status === 201 && response.data) {
      successMessage.value = 'Insurance plan created successfully!'
      
      // Navigate to detail page after 1.5 seconds
      setTimeout(() => {
        router.push(`/insurance-plan/${response.data.id}`)
      }, 1500)
    } else {
      errorMessage.value = response.message || 'Failed to create insurance plan'
    }
  } catch (error: any) {
    console.error('Error creating insurance plan:', error)
    errorMessage.value = error.response?.data?.message || 'An error occurred while creating the insurance plan'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  router.push('/insurance-plan')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.push('/insurance-plan')"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Insurance Plans
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Create Insurance Plan</h1>
        <p class="mt-2 text-gray-600">Add a new insurance plan to the system</p>
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
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
      >
        <svg class="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <InsuranceForm
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
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
          <p class="text-gray-700 font-medium">Creating insurance plan...</p>
        </div>
      </div>
    </div>
  </div>
</template>
