<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClaimForm from '@/components/Claim/ClaimForm.vue'
import { orderedPlanService } from '@/store/orderedPlan'
import { claimService } from '@/store/claim'
import type { OrderedPlan } from '@/interfaces/OrderedPlan'

const route = useRoute()
const router = useRouter()

const orderedPlan = ref<OrderedPlan | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)

// Form data
const proof = ref('')
const claimFormRef = ref<InstanceType<typeof ClaimForm> | null>(null)

// Fetch ordered plan data
const fetchOrderedPlan = async () => {
  try {
    loading.value = true
    error.value = null
    const orderedPlanId = route.params.orderedPlanId as string
    const response = await orderedPlanService.getOrderedPlanById(orderedPlanId)
    
    if (response.status === 200 && response.data) {
      orderedPlan.value = response.data
      
      // Validate if can create claim
      if (orderedPlan.value.status !== 'PAID' && orderedPlan.value.status !== 'WAITING_FOR_REVIEW') {
        error.value = 'Cannot create claim for this ordered plan. Status must be PAID or WAITING_FOR_REVIEW.'
      }
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

// Handle form submission
const handleSubmit = async () => {
  if (!orderedPlan.value || !proof.value.trim()) {
    alert('Please enter claim proof')
    return
  }

  try {
    submitting.value = true
    
    const response = await claimService.createClaim({
      orderedPlanId: orderedPlan.value.id,
      proof: proof.value
    })

    if (response.status === 200 || response.status === 201) {
      alert('Claim created successfully!')
      // Navigate back to ordered plan detail
      router.push(`/ordered-plan/${orderedPlan.value.id}`)
    } else {
      alert(response.message || 'Failed to create claim')
    }
  } catch (err) {
    console.error('Error creating claim:', err)
    alert('Failed to create claim')
  } finally {
    submitting.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  if (orderedPlan.value) {
    router.push(`/ordered-plan/${orderedPlan.value.id}`)
  } else {
    router.push('/policy')
  }
}

onMounted(() => {
  fetchOrderedPlan()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p class="font-medium">{{ error }}</p>
        <button @click="handleCancel" class="mt-2 text-sm underline">Go Back</button>
      </div>

      <!-- Create Claim Form -->
      <div v-else-if="orderedPlan" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Claim Ordered Insurance Plan</h1>
          <p class="text-gray-600 mt-2">
            Fitur ini memungkinkan pengguna untuk membuat Claim untuk suatu Ordered Insurance Plan. 
            Fitur ini dapat diakses pada halaman 
            <router-link 
              :to="`/ordered-plan/${orderedPlan.id}`" 
              class="text-blue-600 hover:underline font-medium"
            >
              Read Detail Ordered Plan
            </router-link>. 
            Pengguna harus memasukkan bukti Claim berupa teks.
          </p>
          <p class="text-gray-600 mt-2">
            Terdapat juga informasi dari Ordered Plan yang ingin di-claim pengguna.
          </p>
        </div>

        <!-- Form Title -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Claim Ordered Plan</h2>
          <p class="text-sm text-gray-600">Submit a claim for your ordered insurance plan</p>
        </div>

        <!-- Claim Form Component -->
        <ClaimForm
          ref="claimFormRef"
          :ordered-plan="orderedPlan"
          v-model:proof="proof"
          @submit="handleSubmit"
        />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="handleCancel"
            :disabled="submitting"
            class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="submitting || !proof.trim()"
            class="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting">Submitting...</span>
            <span v-else>Submit Claim</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
