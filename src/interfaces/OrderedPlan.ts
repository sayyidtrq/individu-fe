import type { ServiceEnum } from './Common'

export interface OrderedPlan {
  id: string
  status: string
  expiredDate: string
  createdAt: string
  updatedAt: string | null
  insurancePlanId: string
  insurancePlanName: string
  insurancePlanPrice: number
  insurancePlanCoverage: number
  insurancePlanCoverageDetails: string
  insurancePlanExpiredByDays: number
  policyId: string
  policyStatus: string
  claims: ClaimInOrderedPlan[]
}

export interface ClaimInOrderedPlan {
  id: string
  status: string
  proof: string
  rejectionReason: string | null
  rejectionDescription: string | null
  rejectionTimestamp: string | null
  acceptedNote: string | null
  acceptedTimestamp: string | null
  daysSinceClaimed: number
  createdAt: string
  updatedAt: string | null
}

export interface OrderedPlanResponseDTO extends OrderedPlan {}

