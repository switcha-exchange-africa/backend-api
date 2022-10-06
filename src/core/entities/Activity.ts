import { ActivityAction } from "../dtos/activity";

export class Activity {
  action: string
  image: string
  type: string
  description: string
  userId: string;
}

export type IActivity =  {
  action: ActivityAction,
  description: string,
  userId: string
}