export enum NotificationMethodType {
  IN_HOUSE = 'in_house',
  TO_USER = 'to_user'
}
export type INotificationUserType = {
  userId: string
  fullName: string
  email: string
}
export class Notification {
  seen?: boolean
  message?: string
  link?: string
  title?: string
  image?: string
  video?: string
  sentTo?: INotificationUserType
  author?: string
  github?: string
  processedBy?: INotificationUserType
  createdAt?: Date
  updatedAt?: Date
  userId?: string
}
export type INotification = {
  userId: string
  title: string
  message: string

}