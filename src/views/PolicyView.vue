<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { policyService } from '@/services/policy'
import type { Policy } from '@/interfaces/Policy'

const policies = ref<Policy[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')

// Fetch data
const fetchPolicies = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await policyService.getAllPolicies()
    policies.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load policies'
    console.error('Error fetching policies:', err)
  } finally {
    loading.value = false
  }
}

// Filtered data based on search
const filteredPolicies = computed(() => {
  if (!searchQuery.value) {
    return policies.value
  }

  const query = searchQuery.value.toLowerCase()
  return policies.value.filter((policy) => {
    return (
      policy.id.toLowerCase().includes(query) ||
      policy.userId.toLowerCase().includes(query) ||
      policy.service.toLowerCase().includes(query) ||
      policy.status.toLowerCase().includes(query)
    )
  })
})

// Paginated data
const paginatedPolicies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPolicies.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredPolicies.value.length / itemsPerPage.value)
})

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'CREATED': 'bg-gray-100 text-gray-800',
    'PAID': 'bg-green-100 text-green-800',
    'PARTIALLY_CLAIMED': 'bg-orange-100 text-orange-800',
    'FULLY_CLAIMED': 'bg-purple-100 text-purple-800',
    'EXPIRED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Format status for display
const formatStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'CREATED': 'Created',
    'PAID': 'Paid',
    'PARTIALLY_CLAIMED': 'Partially Claimed',
    'FULLY_CLAIMED': 'Fully Claimed',
    'EXPIRED': 'Expired'
  }
  return statusMap[status] || status
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
  fetchPolicies()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Policies</h1>
        <p class="text-gray-600 mt-2">Manage and monitor all Policy that have been made by Travelers</p>
      </div>

      <!-- Create New Policy Button -->
      <div class="mb-6">
        <RouterLink
          to="/policy/create"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Policy
        </RouterLink>
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
            <button @click="fetchPolicies" class="mt-2 text-sm underline">Try Again</button>
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    ID
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    User ID
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                  <div class="flex items-center gap-1">
                    Service
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium text-center">
                  <div class="flex items-center justify-center gap-1">
                    Plan Amount
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium text-right">
                  <div class="flex items-center justify-end gap-1">
                    Coverage Amount
                    <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Status</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="policy in paginatedPolicies"
                :key="policy.id"
                class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900">{{ policy.id }}</td>
                <td class="px-6 py-4 text-gray-700">{{ policy.userId }}</td>
                <td class="px-6 py-4 text-gray-900">{{ policy.service }}</td>
                <td class="px-6 py-4 text-gray-900 text-center">{{ policy.orderedPlans?.length || 0 }}</td>
                <td class="px-6 py-4 text-gray-900 text-right">{{ formatCurrency(policy.totalCoverage) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(policy.status)]">
                    {{ formatStatus(policy.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <RouterLink
                      :to="`/policy/${policy.id}`"
                      class="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors"
                    >
                      View
                    </RouterLink>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedPolicies.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                  No policies found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error && filteredPolicies.length > 0" class="p-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Showing info -->
            <div class="text-sm text-gray-700">
              Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} sampai 
              {{ Math.min(currentPage * itemsPerPage, filteredPolicies.length) }} dari 
              {{ filteredPolicies.length }} data
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