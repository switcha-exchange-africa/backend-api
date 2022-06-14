import { Logger } from "@nestjs/common";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } from "src/configuration";
import { SMS_PAYLOAD_TYPE } from "src/frameworks/event-emitter/event/sms.event";
import twilio from "twilio";

export const sendSms = async (payload: SMS_PAYLOAD_TYPE) => {
  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body: payload.body,
      from: TWILIO_PHONE,
      to: payload.to
    })

    Logger.log(message);
  } catch (error) {
    Logger.error('@smsService', error.message);
  }
}

