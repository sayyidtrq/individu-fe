import type { OrderedPlan } from '@/interfaces/OrderedPlan'
import type { BaseResponse } from '@/interfaces/Common'

const API_BASE_URL = 'http://localhost:8080/api/ordered-plan'

export const orderedPlanService = {
  async getOrderedPlanById(id: string): Promise<BaseResponse<OrderedPlan>> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    const result: BaseResponse<OrderedPlan> = await response.json()
    return result
  },

  async getAllOrderedPlans(): Promise<OrderedPlan[]> {
    const response = await fetch(`${API_BASE_URL}/all`)
    if (!response.ok) {
      throw new Error('Failed to fetch ordered plans')
    }
    const result: BaseResponse<OrderedPlan[]> = await response.json()
    return result.data
  },

  async getOrderedPlansByPolicyId(policyId: string): Promise<OrderedPlan[]> {
    const response = await fetch(`${API_BASE_URL}/policy/${policyId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch ordered plans for policy')
    }
    const result: BaseResponse<OrderedPlan[]> = await response.json()
    return result.data
  }
}

export const getOrderedPlanById = orderedPlanService.getOrderedPlanById
export const getAllOrderedPlans = orderedPlanService.getAllOrderedPlans
export const getOrderedPlansByPolicyId = orderedPlanService.getOrderedPlansByPolicyId
