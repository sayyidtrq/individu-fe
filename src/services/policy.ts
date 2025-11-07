import type { Policy, CreatePolicyDTO } from '@/interfaces/Policy'
import type { BaseResponse } from '@/interfaces/Common'

const API_BASE_URL = 'http://localhost:8080/api/policy'

export const policyService = {
  async getAllPolicies(): Promise<Policy[]> {
    const response = await fetch(`${API_BASE_URL}/all`)
    if (!response.ok) {
      throw new Error('Failed to fetch policies')
    }
    const result: BaseResponse<Policy[]> = await response.json()
    return result.data
  },

  async getPolicyById(id: string): Promise<BaseResponse<Policy>> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    const result: BaseResponse<Policy> = await response.json()
    return result
  },

  async createPolicy(data: CreatePolicyDTO): Promise<BaseResponse<Policy>> {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result: BaseResponse<Policy> = await response.json()
    return result
  },

  async payPolicy(id: string): Promise<BaseResponse<Policy>> {
    const response = await fetch(`${API_BASE_URL}/pay/${id}`, {
      method: 'PUT'
    })
    const result: BaseResponse<Policy> = await response.json()
    return result
  }
}

// Export individual functions for easier imports
export const getPolicyById = policyService.getPolicyById
export const createPolicy = policyService.createPolicy
export const payPolicy = policyService.payPolicy