<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderedPlanService } from '@/store/orderedPlan'
import type { OrderedPlan, ClaimInOrderedPlan } from '@/interfaces/OrderedPlan'

const route = useRoute()
const router = useRouter()

const orderedPlan = ref<OrderedPlan | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Modal states
const showAcceptedModal = ref(false)
const showRejectedModal = ref(false)
const selectedClaim = ref<ClaimInOrderedPlan | null>(null)

// Fetch ordered plan data
const fetchOrderedPlan = async () => {
  try {
    loading.value = true
    error.value = null
    const orderedPlanId = route.params.id as string
    const response = await orderedPlanService.getOrderedPlanById(orderedPlanId)
    
    if (response.status === 200 && response.data) {
      orderedPlan.value = response.data
    } else {
      error.value = response.message || 'Failed to load ordered plan'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load ordered plan'
    console.error('Error fetching ordered plan:', err)
  } finally {
    loading.value = false
  }
}

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'ORDERED': 'bg-gray-100 text-gray-800',
    'PAID': 'bg-green-100 text-green-800',
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'CLAIMED': 'bg-purple-100 text-purple-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'EXPIRED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Get claim status badge color
const getClaimStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'ACCEPTED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Format status for display
const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Format datetime
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Check if can create claim
const canCreateClaim = computed(() => {
  if (!orderedPlan.value) return false
  
  // Can create claim if status is PAID or WAITING_FOR_REVIEW
  return orderedPlan.value.status === 'PAID' || orderedPlan.value.status === 'WAITING_FOR_REVIEW'
})

// Handle create claim
const handleCreateClaim = () => {
  if (orderedPlan.value) {
    router.push(`/claim/create/${orderedPlan.value.id}`)
  }
}

// Show claim detail modal
const showClaimDetail = (claim: ClaimInOrderedPlan) => {
  selectedClaim.value = claim
  
  if (claim.status === 'ACCEPTED') {
    showAcceptedModal.value = true
  } else if (claim.status === 'REJECTED') {
    showRejectedModal.value = true
  }
}

onMounted(() => {
  fetchOrderedPlan()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p class="font-medium">{{ error }}</p>
        <button @click="router.push('/policy')" class="mt-2 text-sm underline">Back to Policies</button>
      </div>

      <!-- Ordered Plan Details -->
      <div v-else-if="orderedPlan">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Read Detail Ordered Plan</h1>
            <p class="text-gray-600 mt-2">
              Fitur ini memungkinkan pengguna untuk melihat secara detail informasi dari Ordered Plan. 
              Pada halaman ini terdapat tombol Claim untuk mengakses fitur Claim Ordered Insurance Plan. 
              Terdapat juga data table yang menampilkan daftar Claim untuk Ordered Plan tersebut.
            </p>
          </div>
          <button
            @click="handleCreateClaim"
            class="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            Claim
          </button>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <!-- Title -->
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">Ordered Plan Details</h2>
            <p class="text-sm text-gray-600">Plan ID: {{ orderedPlan.id }}</p>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div class="space-y-4">
                <!-- Plan ID -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Plan ID</label>
                  <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {{ orderedPlan.id }}
                  </div>
                </div>

                <!-- Insurance Plan ID -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Plan ID</label>
                  <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {{ orderedPlan.insurancePlanId }}
                  </div>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div class="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(orderedPlan.status)]">
                      {{ formatStatus(orderedPlan.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Information -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Date Information</h3>
              
              <div class="space-y-4">
                <!-- Expired Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Expired Date</label>
                  <div class="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-gray-900">
                    {{ formatDate(orderedPlan.expiredDate) }}
                  </div>
                </div>

                <!-- Created Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {{ formatDateTime(orderedPlan.createdAt) }}
                  </div>
                </div>

                <!-- Last Updated -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {{ orderedPlan.updatedAt ? formatDateTime(orderedPlan.updatedAt) : formatDateTime(orderedPlan.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Claims Table -->
          <div class="mt-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Claims ({{ orderedPlan.claims?.length || 0 }})
            </h3>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" class="px-6 py-3">Claim ID</th>
                    <th scope="col" class="px-6 py-3">Plan Name</th>
                    <th scope="col" class="px-6 py-3 text-center">Status</th>
                    <th scope="col" class="px-6 py-3 text-center">Days Since Claimed</th>
                    <th scope="col" class="px-6 py-3 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="claim in orderedPlan.claims"
                    :key="claim.id"
                    class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4 font-medium text-gray-900">{{ claim.id }}</td>
                    <td class="px-6 py-4 text-gray-900">{{ orderedPlan.insurancePlanName }}</td>
                    <td class="px-6 py-4 text-center">
                      <span :class="['px-3 py-1 rounded-full text-xs font-medium', getClaimStatusColor(claim.status)]">
                        {{ formatStatus(claim.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-gray-900 text-center">{{ claim.daysSinceClaimed }} days</td>
                    <td class="px-6 py-4 text-center">
                      <button
                        v-if="claim.status === 'ACCEPTED' || claim.status === 'REJECTED'"
                        @click="showClaimDetail(claim)"
                        class="text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Detail
                      </button>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                  </tr>
                  <tr v-if="!orderedPlan.claims || orderedPlan.claims.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                      No claims found for this ordered plan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accepted Claim Detail Modal -->
    <div
      v-if="showAcceptedModal && selectedClaim"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAcceptedModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Accepted Claim Details</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Claim ID</label>
            <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {{ selectedClaim.id }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <div class="px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-gray-900">
              {{ selectedClaim.acceptedNote }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Accepted Timestamp</label>
            <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {{ selectedClaim.acceptedTimestamp ? formatDateTime(selectedClaim.acceptedTimestamp) : '-' }}
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button
            type="button"
            @click="showAcceptedModal = false"
            class="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Rejected Claim Detail Modal -->
    <div
      v-if="showRejectedModal && selectedClaim"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showRejectedModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Rejected Claim Details</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Claim ID</label>
            <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {{ selectedClaim.id }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
            <div class="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-gray-900">
              {{ selectedClaim.rejectionReason }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rejection Description</label>
            <div class="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-gray-900">
              {{ selectedClaim.rejectionDescription }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rejection Timestamp</label>
            <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {{ selectedClaim.rejectionTimestamp ? formatDateTime(selectedClaim.rejectionTimestamp) : '-' }}
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button
            type="button"
            @click="showRejectedModal = false"
            class="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal animation */
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
