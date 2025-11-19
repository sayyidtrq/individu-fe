<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { insurancePlanService } from '@/store/insurancePlan'
import type { InsurancePlan } from '@/interfaces/Insurance'
import { ServiceEnum } from '@/interfaces/Common'
import { DataTable } from 'simple-datatables'

const insurancePlans = ref<InsurancePlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let dataTable: DataTable | null = null

// Fetch data
const fetchInsurancePlans = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await insurancePlanService.getAllInsurancePlans()
    insurancePlans.value = data
    
    // Initialize DataTable after data is loaded
    setTimeout(() => {
      initDataTable()
    }, 100)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load insurance plans'
    console.error('Error fetching insurance plans:', err)
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

// Format services
const formatServices = (services: ServiceEnum[]) => {
  return services.join(', ')
}

// Initialize DataTable
const initDataTable = () => {
  if (dataTable) {
    dataTable.destroy()
  }

  const tableElement = document.getElementById('insurance-table')
  if (tableElement && insurancePlans.value.length > 0) {
    dataTable = new DataTable(tableElement as HTMLTableElement, {
      searchable: true,
      sortable: true,
      perPage: 10,
      perPageSelect: [10, 25, 50, 100],
      labels: {
        placeholder: 'Search...',
        perPage: 'data per halaman',
        noRows: 'No insurance plans found',
        info: 'Menampilkan {start} sampai {end} dari {rows} data'
      },
      columns: [
        { select: 0, sortable: true },
        { select: 1, sortable: true },
        { select: 2, sortable: true },
        { select: 3, sortable: true, type: 'number' },
        { select: 4, sortable: true, type: 'number' },
        { select: 5, sortable: true },
        { select: 6, sortable: true, type: 'number' },
        { select: 7, sortable: false }
      ]
    })
  }
}

onMounted(() => {
  fetchInsurancePlans()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Insurance Plans</h1>
        <p class="text-gray-600 mt-2">Manage and monitor all insurance plans available for travelers</p>
      </div>

      <!-- Add New Plan Button -->
      <div class="mb-6">
        <RouterLink
          to="/insurance-plan/create"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Plan
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
            <button @click="fetchInsurancePlans" class="mt-2 text-sm underline">Try Again</button>
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table id="insurance-table" class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" class="px-6 py-3 font-medium">ID</th>
                <th scope="col" class="px-6 py-3 font-medium">Provider ID</th>
                <th scope="col" class="px-6 py-3 font-medium">Plan Name</th>
                <th scope="col" class="px-6 py-3 font-medium text-right">Price</th>
                <th scope="col" class="px-6 py-3 font-medium text-right">Coverage</th>
                <th scope="col" class="px-6 py-3 font-medium">Applicable Services</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Duration (Days)</th>
                <th scope="col" class="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="plan in insurancePlans"
                :key="plan.id"
                class="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-gray-900" :data-sort="plan.id">{{ plan.id }}</td>
                <td class="px-6 py-4 text-gray-700">{{ plan.providerId }}</td>
                <td class="px-6 py-4 text-gray-900 font-medium">{{ plan.planName }}</td>
                <td class="px-6 py-4 text-gray-900 text-right" :data-sort="plan.price">{{ formatCurrency(plan.price) }}</td>
                <td class="px-6 py-4 text-gray-900 text-right" :data-sort="plan.coverage">{{ formatCurrency(plan.coverage) }}</td>
                <td class="px-6 py-4 text-gray-700">{{ formatServices(plan.applicableService) }}</td>
                <td class="px-6 py-4 text-gray-700 text-center" :data-sort="plan.expiredByDays">{{ plan.expiredByDays }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <RouterLink
                      :to="`/insurance-plan/${plan.id}`"
                      class="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors"
                    >
                      View
                    </RouterLink>
                    <RouterLink
                      :to="`/insurance-plan/edit/${plan.id}`"
                      class="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors"
                    >
                      Edit
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
