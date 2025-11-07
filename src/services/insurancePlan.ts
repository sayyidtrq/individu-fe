import type { InsurancePlan, CreateInsurancePlanDTO } from '@/interfaces/Insurance'
import type { BaseResponse } from '@/interfaces/Common'

const API_BASE_URL = 'http://localhost:8080/api/insurance'

export const insurancePlanService = {
  async getAllInsurancePlans(): Promise<InsurancePlan[]> {
    const response = await fetch(`${API_BASE_URL}/all`)
    if (!response.ok) {
      throw new Error('Failed to fetch insurance plans')
    }
    const result: BaseResponse<InsurancePlan[]> = await response.json()
    return result.data
  },

  async getInsurancePlanById(id: string): Promise<BaseResponse<InsurancePlan>> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    const result: BaseResponse<InsurancePlan> = await response.json()
    return result
  },

  async createInsurancePlan(data: CreateInsurancePlanDTO): Promise<BaseResponse<InsurancePlan>> {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result: BaseResponse<InsurancePlan> = await response.json()
    return result
  },

  async updateInsurancePlan(id: string, data: Partial<InsurancePlan>): Promise<InsurancePlan> {
    const response = await fetch(`${API_BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update insurance plan')
    }
    const result: BaseResponse<InsurancePlan> = await response.json()
    return result.data
  },

  async deleteInsurancePlan(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete insurance plan')
    }
  }
}

// Export individual functions for easier imports
export const getInsurancePlanById = insurancePlanService.getInsurancePlanById
export const createInsurancePlan = insurancePlanService.createInsurancePlan
