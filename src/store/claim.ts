import type { Claim, CreateClaimDTO, AcceptClaimDTO, RejectClaimDTO } from '@/interfaces/Claim'
import type { BaseResponse } from '@/interfaces/Common'

const API_BASE_URL = 'http://localhost:8080/api/claim'

export const claimService = {
  async getAllClaims(status?: string, insurancePlanId?: string): Promise<Claim[]> {
    let url = `${API_BASE_URL}/all`
    const params = new URLSearchParams()
    
    if (status) {
      params.append('status', status)
    }
    if (insurancePlanId) {
      params.append('insurancePlanId', insurancePlanId)
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch claims')
    }
    const result: BaseResponse<Claim[]> = await response.json()
    return result.data
  },

  async getClaimById(id: string): Promise<BaseResponse<Claim>> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    const result: BaseResponse<Claim> = await response.json()
    return result
  },

  async createClaim(data: CreateClaimDTO): Promise<BaseResponse<Claim>> {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result: BaseResponse<Claim> = await response.json()
    return result
  },

  async acceptClaim(id: string, data: AcceptClaimDTO): Promise<BaseResponse<Claim>> {
    const response = await fetch(`${API_BASE_URL}/accept/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result: BaseResponse<Claim> = await response.json()
    return result
  },

  async rejectClaim(id: string, data: RejectClaimDTO): Promise<BaseResponse<Claim>> {
    const response = await fetch(`${API_BASE_URL}/reject/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const result: BaseResponse<Claim> = await response.json()
    return result
  }
}

// Export individual functions for easier imports
export const getClaimById = claimService.getClaimById
export const createClaim = claimService.createClaim
export const acceptClaim = claimService.acceptClaim
export const rejectClaim = claimService.rejectClaim
