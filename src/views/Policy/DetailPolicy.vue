<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Policy } from '@/interfaces/Policy'
import { getPolicyById, payPolicy } from '@/services/policy'

const router = useRouter()
const route = useRoute()

const policy = ref<Policy | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const showPayModal = ref(false)
const isPaying = ref(false)
const payError = ref('')

const fetchPolicy = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const id = route.params.id as string
    const response = await getPolicyById(id)
    
    if (response.status === 200 && response.data) {
      policy.value = response.data
    } else {
      errorMessage.value = response.message || 'Failed to load policy'
    }
  } catch (error: any) {
    console.error('Error fetching policy:', error)
    errorMessage.value = error.response?.data?.message || 'An error occurred while loading the policy'
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' pukul')
}

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'CREATED': 'bg-gray-100 text-gray-800',
    'PAID': 'bg-green-100 text-green-800',
    'PARTIALLY_CLAIMED': 'bg-orange-100 text-orange-800',
    'FULLY_CLAIMED': 'bg-purple-100 text-purple-800',
    'EXPIRED': 'bg-red-100 text-red-800',
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'CLAIMED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'CREATED': 'Created',
    'PAID': 'Paid',
    'PARTIALLY_CLAIMED': 'Partially Claimed',
    'FULLY_CLAIMED': 'Fully Claimed',
    'EXPIRED': 'Expired',
    'WAITING_FOR_REVIEW': 'Waiting For Review',
    'CLAIMED': 'Claimed',
    'REJECTED': 'Rejected'
  }
  return statusMap[status] || status
}

const canPay = computed(() => {
  return policy.value && policy.value.status === 'CREATED'
})

const isPaid = computed(() => {
  return policy.value && (
    policy.value.status === 'PAID' || 
    policy.value.status === 'PARTIALLY_CLAIMED' || 
    policy.value.status === 'FULLY_CLAIMED' ||
    policy.value.status === 'EXPIRED'
  )
})

const handleBack = () => {
  router.push('/policy')
}

const openPayModal = () => {
  showPayModal.value = true
  payError.value = ''
}

const closePayModal = () => {
  showPayModal.value = false
  payError.value = ''
}

const handlePay = async () => {
  if (!policy.value) return
  
  try {
    isPaying.value = true
    payError.value = ''
    
    const response = await payPolicy(policy.value.id)
    
    if (response.status === 200 && response.data) {
      // Update policy with new data
      policy.value = response.data
      closePayModal()
    } else {
      payError.value = response.message || 'Failed to process payment'
    }
  } catch (error: any) {
    console.error('Error paying policy:', error)
    payError.value = error.message || 'Failed to process payment'
  } finally {
    isPaying.value = false
  }
}

const viewOrderedPlanDetail = (orderedPlanId: string) => {
  router.push(`/ordered-plan/${orderedPlanId}`)
}

onMounted(() => {
  fetchPolicy()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Policy</h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <button
          @click="handleBack"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Policies
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="policy">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="handleBack"
            class="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Policies
          </button>
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Policy Details</h1>
              <p class="mt-2 text-gray-600">Policy ID: {{ policy.id }}</p>
            </div>
            <div>
              <button
                v-if="canPay"
                @click="openPayModal"
                class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Pay
              </button>
              <span
                v-else-if="isPaid"
                class="px-6 py-2.5 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed"
              >
                Already Paid
              </span>
            </div>
          </div>
        </div>

        <!-- Policy Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Basic Information -->
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Policy ID</label>
                <p class="text-base text-gray-900 font-mono">{{ policy.id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Booking ID</label>
                <p class="text-base text-gray-900">{{ policy.bookingId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                <p class="text-base text-gray-900">{{ policy.userId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Service</label>
                <p class="text-base text-blue-600 font-medium">{{ policy.service }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <p class="text-base text-gray-900">{{ formatDate(policy.startDate) }}</p>
              </div>
            </div>
          </div>

          <!-- Status & Financial Information -->
          <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Status & Financial Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span :class="['inline-block px-4 py-2 rounded-lg text-sm font-medium', getStatusColor(policy.status)]">
                  {{ formatStatus(policy.status) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Total Price</label>
                <p class="text-2xl text-green-600 font-bold">{{ formatCurrency(policy.totalPrice) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Total Coverage</label>
                <p class="text-2xl text-blue-600 font-bold">{{ formatCurrency(policy.totalCoverage) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Plan Amount</label>
                <p class="text-base text-gray-900">{{ policy.orderedPlans?.length || 0 }} plan(s)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="bg-gray-100 rounded-lg p-4 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">Start Date:</span>
              <p class="text-gray-900 mt-1">{{ formatDate(policy.startDate) }}</p>
            </div>
            <div>
              <span class="font-medium">Created Date:</span>
              <p class="text-gray-900 mt-1">{{ formatDateTime(policy.createdAt) }}</p>
            </div>
            <div>
              <span class="font-medium">Last Updated:</span>
              <p class="text-gray-900 mt-1">{{ policy.updatedAt ? formatDateTime(policy.updatedAt) : '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Ordered Plans Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">
              Ordered Plans ({{ policy.orderedPlans?.length || 0 }})
            </h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Plan ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Insurance Plan ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expired Date</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Claims Count</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="orderedPlan in policy.orderedPlans"
                  :key="orderedPlan.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 text-gray-900 font-medium">{{ orderedPlan.id }}</td>
                  <td class="px-6 py-4 text-gray-700">{{ orderedPlan.insurancePlanId }}</td>
                  <td class="px-6 py-4">
                    <span :class="['inline-block px-3 py-1 rounded-full text-xs font-medium', getStatusColor(orderedPlan.status)]">
                      {{ orderedPlan.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-700">{{ formatDate(orderedPlan.expiredDate) }}</td>
                  <td class="px-6 py-4 text-center text-gray-900">{{ orderedPlan.claims?.length || 0 }}</td>
                  <td class="px-6 py-4 text-center">
                    <button
                      @click="viewOrderedPlanDetail(orderedPlan.id)"
                      class="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
                <tr v-if="!policy.orderedPlans || policy.orderedPlans.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No ordered plans found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pay Confirmation Modal -->
      <div
        v-if="showPayModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closePayModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Confirm Payment</h3>
            <button
              @click="closePayModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="mb-6">
            <p class="text-gray-600 mb-4">
              Are you sure you want to process the payment for this policy?
            </p>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Policy ID:</span>
                <span class="text-sm text-gray-900 font-medium">{{ policy?.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Amount:</span>
                <span class="text-sm text-green-600 font-bold">{{ policy ? formatCurrency(policy.totalPrice) : '' }}</span>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="payError"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-sm text-red-800">{{ payError }}</p>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-3">
            <button
              @click="closePayModal"
              :disabled="isPaying"
              class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              @click="handlePay"
              :disabled="isPaying"
              class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isPaying"
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
              {{ isPaying ? 'Processing...' : 'Continue Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
