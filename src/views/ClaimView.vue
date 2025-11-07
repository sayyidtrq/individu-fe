<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { claimService } from '@/services/claim'
import { insurancePlanService } from '@/services/insurancePlan'
import type { Claim } from '@/interfaces/Claim'
import type { InsurancePlan } from '@/interfaces/Insurance'

const claims = ref<Claim[]>([])
const insurancePlans = ref<InsurancePlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Filters
const statusFilter = ref<string>('')
const insurancePlanFilter = ref<string>('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')

// Fetch insurance plans for filter
const fetchInsurancePlans = async () => {
  try {
    const data = await insurancePlanService.getAllInsurancePlans()
    insurancePlans.value = data
  } catch (err) {
    console.error('Error fetching insurance plans:', err)
  }
}

// Fetch data with filters
const fetchClaims = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await claimService.getAllClaims(
      statusFilter.value || undefined,
      insurancePlanFilter.value || undefined
    )
    claims.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load claims'
    console.error('Error fetching claims:', err)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
  fetchClaims()
}

// Filtered data based on search
const filteredClaims = computed(() => {
  if (!searchQuery.value) {
    return claims.value
  }

  const query = searchQuery.value.toLowerCase()
  return claims.value.filter((claim) => {
    return (
      claim.id.toLowerCase().includes(query) ||
      claim.orderedPlanId.toLowerCase().includes(query) ||
      claim.insurancePlanName.toLowerCase().includes(query) ||
      claim.status.toLowerCase().includes(query)
    )
  })
})

// Paginated data
const paginatedClaims = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredClaims.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredClaims.value.length / itemsPerPage.value)
})

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'ACCEPTED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Handle page change
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset to first page when search changes
const handleSearch = () => {
  currentPage.value = 1
}

onMounted(() => {
  fetchInsurancePlans()
  fetchClaims()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Claims</h1>
        <p class="text-gray-600 mt-2">Manage and monitor all Claims submitted by users</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Filter by Status -->
          <div>
            <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              v-model="statusFilter"
              @change="applyFilters"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="WAITING_FOR_REVIEW">Waiting For Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <!-- Filter by Insurance Plan -->
          <div>
            <label for="insurancePlanFilter" class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Insurance Plan
            </label>
            <select
              id="insurancePlanFilter"
              v-model="insurancePlanFilter"
              @change="applyFilters"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Insurance Plans</option>
              <option
                v-for="plan in insurancePlans"
                :key="plan.id"
                :value="plan.id"
              >
                {{ plan.planName }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- DataTable Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Table Controls -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row justify-between gap-4">
            <!-- Show entries dropdown -->
            <div class="flex items-center gap-2">
              <label for="entries" class="text-sm text-gray-700">Tampilkan</label>
              <select
                id="entries"
                v-model="itemsPerPage"
                class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @change="currentPage = 1"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
              <span class="text-sm text-gray-700">data per halaman</span>
            </div>

            <!-- Search -->
            <div class="flex items-center gap-2">
              <label for="search" class="text-sm text-gray-700">Cari:</label>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="px-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8 text-center">
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
            <p class="font-medium">{{ error }}</p>
            <button @click="fetchClaims" class="mt-2 text-sm underline">Try Again</button>
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    Claim ID
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    Ordered Plan ID
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    Plan Name
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium text-center">
                  <div class="flex items-center justify-center gap-1">
                    Days Since Claimed
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Status</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Process</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="claim in paginatedClaims"
                :key="claim.id"
                class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900">{{ claim.id }}</td>
                <td class="px-6 py-4 text-gray-700">{{ claim.orderedPlanId }}</td>
                <td class="px-6 py-4 text-gray-900">{{ claim.insurancePlanName }}</td>
                <td class="px-6 py-4 text-gray-900 text-center">{{ claim.daysSinceClaimed }} days</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(claim.status)]">
                    {{ claim.status === 'WAITING_FOR_REVIEW' ? 'Waiting For Review' : claim.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <RouterLink
                    :to="`/claim/process/${claim.id}`"
                    class="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Process
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="paginatedClaims.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  No claims found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error && filteredClaims.length > 0" class="p-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Showing info -->
            <div class="text-sm text-gray-700">
              Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} sampai 
              {{ Math.min(currentPage * itemsPerPage, filteredClaims.length) }} dari 
              {{ filteredClaims.length }} data
            </div>

            <!-- Pagination buttons -->
            <div class="flex items-center gap-1">
              <button
                @click="goToPage(1)"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Pertama
              </button>
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>

              <!-- Page numbers -->
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1.5 text-sm border rounded-lg transition-colors',
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
              <button
                @click="goToPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Terakhir
              </button>
            </div>
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
