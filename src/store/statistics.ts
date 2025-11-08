import type { BaseResponse, DashboardStats, Statistics } from '@/interfaces/Statistics'

const API_BASE_URL = 'http://localhost:8080/api/statistics'

export const statisticsService = {
  /**
   * Get dashboard statistics (Insurance Plans, Policies, Claims Processed)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`)
      const result: BaseResponse<DashboardStats> = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard statistics')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  },

  /**
   * Get statistics of Insurance Plans purchased based on Service and Time Period
   * @param timePeriod - "6_MONTHS", "3_MONTHS", or "12_MONTHS"
   * @param service - "ACCOMMODATION", "FLIGHT", "PACKAGE", "RENTAL", or null for ALL_SERVICES
   */
  async getStatistics(timePeriod: string, service?: string): Promise<Statistics> {
    try {
      const params = new URLSearchParams({ timePeriod })
      if (service && service !== 'ALL_SERVICES') {
        params.append('service', service)
      }

      const response = await fetch(`${API_BASE_URL}?${params}`)
      const result: BaseResponse<Statistics> = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch statistics')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  }
}
