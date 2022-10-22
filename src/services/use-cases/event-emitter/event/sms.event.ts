export class SmsSentEvent {
  to: string;
  body: string;
  variables?: Record<string, any>;
}

export interface SMS_PAYLOAD_TYPE extends SmsSentEvent { }