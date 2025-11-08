<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { InsurancePlan } from '@/interfaces/Insurance'
import { getInsurancePlanById, insurancePlanService } from '@/store/insurancePlan'

const router = useRouter()
const route = useRoute()

const insurancePlan = ref<InsurancePlan | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')

const fetchInsurancePlan = async () => {
  try {
    isLoading.value = true
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
    isLoading.value = false
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatServices = (services: string[]): string => {
  return services.join(', ')
}

const handleEdit = () => {
  router.push(`/insurance-plan/edit/${route.params.id}`)
}

const handleBack = () => {
  router.push('/insurance-plan')
}

const openDeleteModal = () => {
  showDeleteModal.value = true
  deleteError.value = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteError.value = ''
}

const handleDelete = async () => {
  if (!insurancePlan.value) return
  
  try {
    isDeleting.value = true
    deleteError.value = ''
    
    await insurancePlanService.deleteInsurancePlan(insurancePlan.value.id)
    
    // Success - redirect to list page
    router.push('/insurance-plan')
  } catch (error: any) {
    console.error('Error deleting insurance plan:', error)
    deleteError.value = error.message || 'Failed to delete insurance plan. Please make sure all ordered plans have expired.'
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchInsurancePlan()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <svg
          class="animate-spin h-12 w-12 text-blue-600"
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
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Insurance Plan</h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <button
          @click="handleBack"
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
            @click="handleBack"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Insurance Plans
          </button>
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ insurancePlan.planName }}</h1>
              <p class="mt-2 text-gray-600">Insurance Plan Details</p>
            </div>
            <div class="flex gap-3">
              <button
                @click="handleEdit"
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Plan
              </button>
              <button
                @click="openDeleteModal"
                class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Plan
              </button>
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- Basic Information -->
          <div class="p-6 md:p-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Insurance Plan ID</label>
                <p class="text-base text-gray-900 font-mono">{{ insurancePlan.id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Provider ID</label>
                <p class="text-base text-gray-900">{{ insurancePlan.providerId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Plan Name</label>
                <p class="text-base text-gray-900 font-semibold">{{ insurancePlan.planName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Expired By Days</label>
                <p class="text-base text-gray-900">{{ insurancePlan.expiredByDays }} days</p>
              </div>
            </div>
          </div>

          <!-- Pricing & Coverage -->
          <div class="p-6 md:p-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Pricing & Coverage</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Price</label>
                <p class="text-2xl text-gray-900 font-bold">{{ formatCurrency(insurancePlan.price) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Coverage</label>
                <p class="text-2xl text-green-600 font-bold">{{ formatCurrency(insurancePlan.coverage) }}</p>
              </div>
            </div>
          </div>

          <!-- Coverage Details -->
          <div class="p-6 md:p-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Coverage Details</h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ insurancePlan.coverageDetails }}</p>
          </div>

          <!-- Applicable Services -->
          <div class="p-6 md:p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Applicable Services</h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="service in insurancePlan.applicableService"
                :key="service"
                class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ service }}
              </span>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="mt-6 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="font-medium">Created:</span>
              {{ new Date(insurancePlan.createdAt).toLocaleString('id-ID') }}
            </div>
            <div>
              <span class="font-medium">Last Updated:</span>
              {{ new Date(insurancePlan.updatedAt).toLocaleString('id-ID') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <!-- Modal Content -->
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Insurance Plan</h3>
            <p class="text-gray-600 mb-1">
              Are you sure you want to delete
            </p>
            <p class="text-gray-900 font-semibold mb-3">
              "{{ insurancePlan?.planName }}"?
            </p>
            <p class="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="deleteError"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-sm text-red-800">{{ deleteError }}</p>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-3">
            <button
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              :disabled="isDeleting"
              class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isDeleting"
                class="animate-spin h-4 w-4"
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
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
