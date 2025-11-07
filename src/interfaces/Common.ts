export enum ServiceEnum {
  ACCOMMODATION = 'ACCOMMODATION',
  FLIGHT = 'FLIGHT',
  PACKAGE = 'PACKAGE',
  RENTAL = 'RENTAL'
}

export interface BaseResponse<T> {
  status: number
  message: string
  timestamp: string
  data: T
}
