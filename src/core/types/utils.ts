import { IActivity } from "../entities/Activity"
import { INotification } from "../entities/notification.entity"

export type IUtilsNotification = {
  activity: IActivity,
  notification: INotification
}