<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { claimService } from '@/services/claim'
import type { Claim } from '@/interfaces/Claim'

const route = useRoute()
const router = useRouter()

const claim = ref<Claim | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Form data
const decision = ref<'accept' | 'reject'>('accept')
const acceptanceNote = ref('')
const rejectionReason = ref('')
const rejectionDescription = ref('')

// Modal state
const showModal = ref(false)
const processing = ref(false)

// Fetch claim data
const fetchClaim = async () => {
  try {
    loading.value = true
    error.value = null
    const claimId = route.params.id as string
    const response = await claimService.getClaimById(claimId)
    
    if (response.status === 200 && response.data) {
      claim.value = response.data
    } else {
      error.value = response.message || 'Failed to load claim'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load claim'
    console.error('Error fetching claim:', err)
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = () => {
  // Validate form
  if (decision.value === 'accept' && !acceptanceNote.value.trim()) {
    alert('Please enter an acceptance note')
    return
  }

  if (decision.value === 'reject') {
    if (!rejectionReason.value.trim()) {
      alert('Please select a rejection reason')
      return
    }
    if (!rejectionDescription.value.trim()) {
      alert('Please enter a rejection description')
      return
    }
  }

  // Show confirmation modal
  showModal.value = true
}

// Process claim (accept/reject)
const processClaim = async () => {
  if (!claim.value) return

  try {
    processing.value = true
    
    if (decision.value === 'accept') {
      const response = await claimService.acceptClaim(claim.value.id, {
        acceptedNote: acceptanceNote.value
      })

      if (response.status === 200) {
        alert('Claim has been accepted successfully!')
        router.push('/claim')
      } else {
        alert(response.message || 'Failed to accept claim')
      }
    } else {
      const response = await claimService.rejectClaim(claim.value.id, {
        rejectionReason: rejectionReason.value,
        rejectionDescription: rejectionDescription.value
      })

      if (response.status === 200) {
        alert('Claim has been rejected successfully!')
        router.push('/claim')
      } else {
        alert(response.message || 'Failed to reject claim')
      }
    }
  } catch (err) {
    console.error('Error processing claim:', err)
    alert(err instanceof Error ? err.message : 'Failed to process claim')
  } finally {
    processing.value = false
    showModal.value = false
  }
}

// Cancel action
const handleCancel = () => {
  router.push('/claim')
}

onMounted(() => {
  fetchClaim()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p class="font-medium">{{ error }}</p>
        <button @click="handleCancel" class="mt-2 text-sm underline">Back to Claims</button>
      </div>

      <!-- Process Claim Form -->
      <div v-else-if="claim" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Process Claim</h1>
          <p class="text-gray-600 mt-2">Review and make a decision on the submitted claim</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Claim ID (Read-only) -->
          <div>
            <label for="claimId" class="block text-sm font-medium text-gray-700 mb-2">
              Claim ID <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="claimId"
              :value="claim.id"
              disabled
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p class="text-sm text-gray-500 mt-1">This field is automatically filled and cannot be changed.</p>
          </div>

          <!-- Claim Proof (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Claim Proof
            </label>
            <div class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              {{ claim.proof }}
            </div>
            <p class="text-sm text-gray-500 mt-1">This is the proof submitted by the claimant for review.</p>
          </div>

          <!-- Decision Dropdown -->
          <div>
            <label for="decision" class="block text-sm font-medium text-gray-700 mb-2">
              Decision <span class="text-red-500">*</span>
            </label>
            <select
              id="decision"
              v-model="decision"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="accept">Accept Claim</option>
              <option value="reject">Reject Claim</option>
            </select>
          </div>

          <!-- Acceptance Note (shown when Accept is selected) -->
          <div v-if="decision === 'accept'">
            <label for="acceptanceNote" class="block text-sm font-medium text-gray-700 mb-2">
              Acceptance Note <span class="text-red-500">*</span>
            </label>
            <textarea
              id="acceptanceNote"
              v-model="acceptanceNote"
              rows="4"
              placeholder="Add notes about the claim acceptance..."
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- Rejection Reason (shown when Reject is selected) -->
          <div v-if="decision === 'reject'">
            <label for="rejectionReason" class="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span class="text-red-500">*</span>
            </label>
            <select
              id="rejectionReason"
              v-model="rejectionReason"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select a reason</option>
              <option value="INSUFFICIENT_PROOF">Insufficient Proof</option>
              <option value="INVALID_CLAIM">Invalid Claim</option>
              <option value="DUPLICATE_CLAIM">Duplicate Claim</option>
              <option value="POLICY_VIOLATION">Policy Violation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <!-- Rejection Description (shown when Reject is selected) -->
          <div v-if="decision === 'reject'">
            <label for="rejectionDescription" class="block text-sm font-medium text-gray-700 mb-2">
              Rejection Description <span class="text-red-500">*</span>
            </label>
            <textarea
              id="rejectionDescription"
              v-model="rejectionDescription"
              rows="4"
              placeholder="Add detailed description about the rejection..."
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="handleCancel"
              class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Process Claim
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Confirm {{ decision === 'accept' ? 'Acceptance' : 'Rejection' }}
        </h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to {{ decision === 'accept' ? 'accept' : 'reject' }} this claim?
          <span v-if="decision === 'accept'">
            The claim status will be changed to <strong>ACCEPTED</strong> and the related ordered plan status will be changed to <strong>CLAIMED</strong>.
          </span>
          <span v-else>
            The claim status will be changed to <strong>REJECTED</strong>.
          </span>
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="showModal = false"
            :disabled="processing"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="processClaim"
            :disabled="processing"
            :class="[
              'px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50',
              decision === 'accept'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            ]"
          >
            <span v-if="processing">Processing...</span>
            <span v-else>{{ decision === 'accept' ? 'Accept Claim' : 'Reject Claim' }}</span>
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
