export interface DashboardStats {
  totalInsurancePlans: number
  totalPolicies: number
  totalClaimsProcessed: number
}

export interface Statistics {
  timePeriod: string
  service: string
  startDate: string
  endDate: string
  totalOrderedPlans: number
  breakdownByService?: Record<string, number> | null
}

export interface BaseResponse<T> {
  status: number
  message: string
  timestamp: string
  data: T
}
