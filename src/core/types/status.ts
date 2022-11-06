
export enum Status {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DENIED = 'denied',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  FILLED = 'filled',
  RESOLVED = 'resolved'
}
export const STATUS_LIST = [
  Status.PENDING,
  Status.PROCESSING,
  Status.APPROVED,
  Status.DENIED,
  Status.CANCELLED,
  Status.EXPIRED,
  Status.COMPLETED,
  Status.PARTIAL,
  Status.FILLED,
  Status.RESOLVED,

]