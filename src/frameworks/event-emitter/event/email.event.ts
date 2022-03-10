export class EmailSentEvent {
  to: string;
  subject: string;
  html: string;
  variables?: Record<string, any>
}

export interface EMAIL_PAYLOAD_TYPE extends EmailSentEvent { }