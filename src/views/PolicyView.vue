<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { policyService } from '@/store/policy'
import type { Policy } from '@/interfaces/Policy'
import { DataTable } from 'simple-datatables'

const policies = ref<Policy[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let dataTable: DataTable | null = null

// Fetch data
const fetchPolicies = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await policyService.getAllPolicies()
    policies.value = data
    
    // Initialize DataTable after data is loaded
    setTimeout(() => {
      initDataTable()
    }, 100)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load policies'
    console.error('Error fetching policies:', err)
  } finally {
    loading.value = false
  }
}

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

// Initialize DataTable
const initDataTable = () => {
  if (dataTable) {
    dataTable.destroy()
  }

  const tableElement = document.getElementById('policy-table')
  if (tableElement && policies.value.length > 0) {
    dataTable = new DataTable(tableElement as HTMLTableElement, {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [10, 25, 50, 100],
      labels: {
        placeholder: 'Search...',
        perPage: 'data per halaman',
        noRows: 'No policies found',
        info: 'Menampilkan {start} sampai {end} dari {rows} data'
      },
      columns: [
        { select: 0, sortable: true },
        { select: 1, sortable: true },
        { select: 2, sortable: true },
        { select: 3, sortable: true, type: 'number' },
        { select: 4, sortable: true, type: 'number' },
        { select: 5, sortable: true },
        { select: 6, sortable: false }
      ]
    })
  }
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
          <table id="policy-table" class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-6 py-3 font-medium">ID</th>
                <th scope="col" class="px-6 py-3 font-medium">User ID</th>
                <th scope="col" class="px-6 py-3 font-medium">Service</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Plan Amount</th>
                <th scope="col" class="px-6 py-3 font-medium text-right">Coverage Amount</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Status</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="policy in policies"
                :key="policy.id"
                class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900" :data-sort="policy.id">{{ policy.id }}</td>
                <td class="px-6 py-4 text-gray-700">{{ policy.userId }}</td>
                <td class="px-6 py-4 text-gray-900">{{ policy.service }}</td>
                <td class="px-6 py-4 text-gray-900 text-center" :data-sort="policy.orderedPlans?.length || 0">{{ policy.orderedPlans?.length || 0 }}</td>
                <td class="px-6 py-4 text-gray-900 text-right" :data-sort="policy.totalCoverage">{{ formatCurrency(policy.totalCoverage) }}</td>
                <td class="px-6 py-4 text-center" :data-sort="policy.status">
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
            </tbody>
          </table>
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