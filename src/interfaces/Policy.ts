import type { ServiceEnum } from './Common'

export interface OrderedPlan {
  id: string
  insurancePlanId: string
  insurancePlanName: string
  price: number
  coverage: number
  expiredDate: string
  status: string
  claims?: Claim[]
}

export interface Claim {
  id: string
  claimAmount: number
  claimDate: string
  status: string
  claimDetails: string
}

export interface Policy {
  id: string
  userId: string
  bookingId: string
  service: ServiceEnum
  startDate: string
  status: string
  totalCoverage: number
  totalPrice: number
  orderedPlans?: OrderedPlan[]
  createdAt: string
  updatedAt: string | null
}

export interface CreatePolicyDTO {
  userId: string
  bookingId: string
  service: ServiceEnum
  insurancePlanIds: string[]
}

export interface PolicyResponseDTO extends Policy {}
