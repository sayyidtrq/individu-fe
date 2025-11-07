<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statisticsService } from '@/services/statistics'
import type { DashboardStats } from '@/interfaces/Statistics'

const stats = ref<DashboardStats>({
  totalInsurancePlans: 0,
  totalPolicies: 0,
  totalClaimsProcessed: 0
})

const loading = ref(true)
const error = ref<string | null>(null)

const fetchDashboardStats = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await statisticsService.getDashboardStats()
    stats.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard statistics'
    console.error('Error loading dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center mb-16 mt-20">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span class="text-blue-600">Insurance</span>
        </h1>
        <p class="text-xl text-gray-600">Your comprehensive travel insurance management platform</p>
      </div>

      <!-- Platform Statistics -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-12">Platform <span class="text-blue-600">Statistics</span> </h2>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{{ error }}</p>
          <button @click="fetchDashboardStats" class="mt-2 text-sm underline">Try Again</button>
        </div>

        <!-- Stats Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <!-- Insurance Plans Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-left">
            <h3 class="text-gray-700 font-medium text-sm mb-2">Insurance Plans</h3>
            <div class="flex items-center justify-between">
              <p class="text-5xl font-bold text-blue-600">{{ stats.totalInsurancePlans }}</p>
              <div class="bg-blue-50 rounded-xl p-3">
                
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">Active insurance plans available</p>
          </div>

          <!-- Insurance Policies Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-left">
            <h3 class="text-gray-700 font-medium text-sm mb-2">Insurance Policies</h3>
            <div class="flex items-center justify-between">
              <p class="text-5xl font-bold text-blue-600">{{ stats.totalPolicies }}</p>
              <div class="bg-red-50 rounded-xl p-3">
               
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">Total policies issued to travelers</p>
          </div>

          <!-- Claims Processed Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-left">
            <h3 class="text-gray-700 font-medium text-sm mb-2">Claims Processed</h3>
            <div class="flex items-center justify-between">
              <p class="text-5xl font-bold text-blue-600">{{ stats.totalClaimsProcessed }}</p>
              <div class="bg-green-50 rounded-xl p-3">
                
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">Claims handled and resolved</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
