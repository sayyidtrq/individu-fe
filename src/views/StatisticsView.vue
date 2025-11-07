<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { statisticsService } from '@/services/statistics'
import LineChart from '@/components/Statistics/LineChart.vue'
import type { Statistics } from '@/interfaces/Statistics'

const loading = ref(true)
const error = ref<string | null>(null)
const statistics = ref<Statistics | null>(null)

// Filter states
const timePeriod = ref('3_MONTHS')
const service = ref('ALL_SERVICES')

// Time period options
const timePeriodOptions = [
  { value: '3_MONTHS', label: '3 Months' },
  { value: '6_MONTHS', label: '6 Months' },
  { value: '12_MONTHS', label: '12 Months' }
]

// Service options
const serviceOptions = [
  { value: 'ALL_SERVICES', label: 'All Services' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'FLIGHT', label: 'Flight' },
  { value: 'PACKAGE', label: 'Package' },
  { value: 'RENTAL', label: 'Rental' }
]

// Fetch statistics
const fetchStatistics = async () => {
  try {
    loading.value = true
    error.value = null
    
    const serviceParam = service.value === 'ALL_SERVICES' ? undefined : service.value
    const data = await statisticsService.getStatistics(timePeriod.value, serviceParam)
    
    statistics.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load statistics'
    console.error('Error fetching statistics:', err)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes
watch([timePeriod, service], () => {
  fetchStatistics()
})

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Insurance Plan Statistics</h1>
        <p class="text-gray-600 mt-2">View the number of insurance plans ordered over time</p>
      </div>

      <!-- Filters Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Time Period Filter -->
          <div>
            <label for="timePeriod" class="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              id="timePeriod"
              v-model="timePeriod"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="option in timePeriodOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Service Filter -->
          <div>
            <label for="service" class="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              id="service"
              v-model="service"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="option in serviceOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Loading statistics...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p class="font-medium">{{ error }}</p>
        <button @click="fetchStatistics" class="mt-2 text-sm underline">Try Again</button>
      </div>

      <!-- Chart -->
      <div v-else-if="statistics">
        <LineChart :statistics="statistics" />
        
        <!-- Breakdown by Service (if ALL_SERVICES selected) -->
        <div v-if="statistics.breakdownByService && service === 'ALL_SERVICES'" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Breakdown by Service</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="(count, serviceName) in statistics.breakdownByService"
              :key="serviceName"
              class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
            >
              <p class="text-sm font-medium text-gray-700 mb-1">{{ serviceName }}</p>
              <p class="text-2xl font-bold text-blue-600">{{ count }}</p>
            </div>
          </div>
        </div>

        <!-- Summary Info -->
        <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-gray-600">Time Period</p>
              <p class="text-lg font-semibold text-gray-900">{{ statistics.timePeriod }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Service</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ statistics.service === 'ALL_SERVICES' ? 'All Services' : statistics.service }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Ordered Plans</p>
              <p class="text-lg font-semibold text-blue-600">{{ statistics.totalOrderedPlans }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
