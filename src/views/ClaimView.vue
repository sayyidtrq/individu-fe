<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { claimService } from '@/store/claim'
import { insurancePlanService } from '@/store/insurancePlan'
import type { Claim } from '@/interfaces/Claim'
import type { InsurancePlan } from '@/interfaces/Insurance'
import { DataTable } from 'simple-datatables'

const claims = ref<Claim[]>([])
const insurancePlans = ref<InsurancePlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let dataTable: DataTable | null = null

// Filters
const statusFilter = ref<string>('')
const insurancePlanFilter = ref<string>('')

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
    
    // Initialize DataTable after data is loaded
    setTimeout(() => {
      initDataTable()
    }, 100)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load claims'
    console.error('Error fetching claims:', err)
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  fetchClaims()
}

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'ACCEPTED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Initialize DataTable
const initDataTable = () => {
  if (dataTable) {
    dataTable.destroy()
  }

  const tableElement = document.getElementById('claim-table')
  if (tableElement && claims.value.length > 0) {
    dataTable = new DataTable(tableElement as HTMLTableElement, {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [10, 25, 50, 100],
      labels: {
        placeholder: 'Search...',
        perPage: 'data per halaman',
        noRows: 'No claims found',
        info: 'Menampilkan {start} sampai {end} dari {rows} data'
      },
      columns: [
        { select: 0, sortable: true },
        { select: 1, sortable: true },
        { select: 2, sortable: true },
        { select: 3, sortable: true, type: 'number' },
        { select: 4, sortable: true },
        { select: 5, sortable: false }
      ]
    })
  }
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
          <table id="claim-table" class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-6 py-3 font-medium">Claim ID</th>
                <th scope="col" class="px-6 py-3 font-medium">Ordered Plan ID</th>
                <th scope="col" class="px-6 py-3 font-medium">Plan Name</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Days Since Claimed</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Status</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Process</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="claim in claims"
                :key="claim.id"
                class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900" :data-sort="claim.id">{{ claim.id }}</td>
                <td class="px-6 py-4 text-gray-700">{{ claim.orderedPlanId }}</td>
                <td class="px-6 py-4 text-gray-900">{{ claim.insurancePlanName }}</td>
                <td class="px-6 py-4 text-gray-900 text-center" :data-sort="claim.daysSinceClaimed">{{ claim.daysSinceClaimed }} days</td>
                <td class="px-6 py-4 text-center" :data-sort="claim.status">
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
