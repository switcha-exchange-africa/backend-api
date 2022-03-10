import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { sendSms } from "src/lib/send-sms";
import { SmsSentEvent } from "../event/sms.event";

@Injectable()
export class SmsSentListener {
    @OnEvent('send.sms', { async: true })
    async handleSmsSendEvent(event: SmsSentEvent) {
        //Handle and process sms sent event here
        console.log("-------event works ----------")
        console.log(event);
        console.log("-------event works ----------")
        console.log(event);
        const { to, body, variables } = event;
        await sendSms({ to, body, variables});
        console.log("-------event works ----------")
    }

    @OnEvent('sent.sms')
    handleSmsSentEvent(event: SmsSentEvent) {
        //Handle and process email sent event here
        console.log("-------event works ----------")
        console.log(event);
        console.log("-------event works ----------")

    }
}