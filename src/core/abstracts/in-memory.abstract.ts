// import { NotificationMethodType } from "../entities/notification.entity";


export abstract class IInMemoryServices {
  abstract set?(key: string, value: any, expiry: number);
  abstract get(key: string);
  abstract del(key: string);
}
