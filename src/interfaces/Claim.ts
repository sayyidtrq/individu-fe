export interface Claim {
  id: string
  status: string
  proof: string
  rejectionReason: string | null
  rejectionDescription: string | null
  rejectionTimestamp: string | null
  acceptedNote: string | null
  acceptedTimestamp: string | null
  orderedPlanId: string
  orderedPlanStatus: string
  insurancePlanId: string
  insurancePlanName: string
  daysSinceClaimed: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateClaimDTO {
  orderedPlanId: string
  proof: string
}

export interface AcceptClaimDTO {
  acceptedNote: string
}

export interface RejectClaimDTO {
  rejectionReason: string
  rejectionDescription: string
}

export interface ClaimResponseDTO extends Claim {}
