import { PaginationType } from "src/core/types/database";

export type IGetNotifications = PaginationType & {  
  userId: string;

}