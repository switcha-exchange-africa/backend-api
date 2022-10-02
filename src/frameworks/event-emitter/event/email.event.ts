export class EmailSentEvent {
  to?: string;
  subject?: string;
  html?: string;
  variables?: Record<string, any>
  fromEmail?: string
  fromName?: string
  toEmail?: string
  toName?: string
  templateId?: string
}

export interface EMAIL_PAYLOAD_TYPE extends EmailSentEvent { }