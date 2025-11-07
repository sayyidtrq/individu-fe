<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OrderedPlan } from '@/interfaces/OrderedPlan'

interface Props {
  orderedPlan: OrderedPlan
}

const props = defineProps<Props>()

// Form data
const proof = ref('')

// Emit events
const emit = defineEmits<{
  'update:proof': [value: string]
  submit: []
}>()

// Watch proof changes and emit
const handleProofChange = () => {
  emit('update:proof', proof.value)
}

// Format status for display
const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ')
}

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PAID': 'bg-green-100 text-green-800',
    'WAITING_FOR_REVIEW': 'bg-blue-100 text-blue-800',
    'CLAIMED': 'bg-purple-100 text-purple-800',
    'EXPIRED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Handle form submission
const handleSubmit = () => {
  emit('submit')
}

// Expose proof for parent access
defineExpose({
  proof,
  resetForm: () => {
    proof.value = ''
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Ordered Plan Information Section -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">Ordered Plan Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-600 font-medium">Plan ID:</span>
          <span class="text-blue-600 font-semibold ml-2">{{ orderedPlan.id }}</span>
        </div>
        <div>
          <span class="text-gray-600 font-medium">Insurance Plan ID:</span>
          <span class="text-blue-600 font-semibold ml-2">{{ orderedPlan.insurancePlanId }}</span>
        </div>
        <div>
          <span class="text-gray-600 font-medium">Status:</span>
          <span :class="['ml-2 px-2 py-1 rounded text-xs font-medium', getStatusColor(orderedPlan.status)]">
            {{ formatStatus(orderedPlan.status) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Form Fields -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Ordered Plan ID (Read-only) -->
      <div>
        <label for="orderedPlanId" class="block text-sm font-medium text-gray-700 mb-2">
          Ordered Plan ID <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="orderedPlanId"
          :value="orderedPlan.id"
          disabled
          class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
        />
        <p class="text-sm text-gray-500 mt-1">This field is automatically filled and cannot be changed.</p>
      </div>

      <!-- Proof -->
      <div>
        <label for="proof" class="block text-sm font-medium text-gray-700 mb-2">
          Proof <span class="text-red-500">*</span>
        </label>
        <textarea
          id="proof"
          v-model="proof"
          @input="handleProofChange"
          rows="6"
          required
          placeholder="Enter your proof of claim (e.g., receipts, documents, incident description...)"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">Provide detailed evidence to support your claim.</p>
      </div>
    </form>
  </div>
</template>
