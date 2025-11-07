import type { ServiceEnum } from './Common'

export interface InsurancePlan {
  id: string
  providerId: string
  planName: string
  price: number
  coverage: number
  coverageDetails: string
  applicableService: ServiceEnum[]
  expiredByDays: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateInsurancePlanDTO {
  providerId: string
  planName: string
  price: number
  coverage: number
  coverageDetails: string
  applicableService: ServiceEnum[]
  expiredByDays: number
}

export interface UpdateInsurancePlanDTO {
  planName: string
  price: number
  coverage: number
  coverageDetails: string
  applicableService: ServiceEnum[]
  expiredByDays: number
}
