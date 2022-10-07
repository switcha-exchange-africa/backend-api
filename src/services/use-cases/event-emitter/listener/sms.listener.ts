import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE } from "src/configuration";
import twilio from "twilio";
import { SmsSentEvent } from "../event/sms.event";

@Injectable()
export class SmsSentListener {
    @OnEvent('send.sms', { async: true })
    async handleSmsSendEvent(event: SmsSentEvent) {
        try {
            const { to, body } = event;
            const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            const message = await client.messages.create({ body, from: TWILIO_PHONE, to: to })
            Logger.log(message)

        } catch (e) {

        }

    }

    @OnEvent('sent.sms')
    handleSmsSentEvent(event: SmsSentEvent) {
        //Handle and process email sent event here
        console.log("-------event works ----------")
        console.log(event);
        console.log("-------event works ----------")

    }
}