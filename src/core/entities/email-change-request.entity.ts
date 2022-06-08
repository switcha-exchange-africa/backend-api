export enum EmailChangeRequestStatus {
  PENDING = 'pending',
  DENIED = 'denied',
  APPROVED = 'approved'
}

export const EmailChangeRequestStatusList = [
  EmailChangeRequestStatus.PENDING,
  EmailChangeRequestStatus.DENIED,
  EmailChangeRequestStatus.APPROVED,

]


export class EmailChangeRequest {
  email: string
  reason: string
  status: EmailChangeRequestStatus;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}