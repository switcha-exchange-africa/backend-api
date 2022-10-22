export type WebPushKey = {
  auth: string
  p256dh: string
}


export class WebPush {
  key: WebPushKey
  userId: string;
  endpoint: string
  expirationTime: number
}

