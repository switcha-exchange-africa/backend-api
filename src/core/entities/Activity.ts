import { ActivityAction } from "../dtos/activity";

export class Activity {
  action: string
  image: string
  type: string
  description: string
  userId: string;
  coin: string
  amount: number;
}

export type IActivity = {
  action: ActivityAction,
  description: string,
  userId: string
  amount: number
  coin?: string
}