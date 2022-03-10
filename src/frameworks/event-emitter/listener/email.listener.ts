
  
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { sendMail } from "src/lib/send-email";
import { EmailSentEvent } from "../event/email.event";

@Injectable()
export class EmailSentListener {
    @OnEvent('send.email', { async: true })
    async handleEmailSendEvent(event: EmailSentEvent) {
        //Handle and process email sent event here
        console.log("-------event works ----------")
        console.log(event);
        console.log("-------event works ----------")
        const { to, subject, html, variables } = event
        await sendMail({ to, subject, html, variables })

    }

    @OnEvent('sent.email')
    handleEmailSentEvent(event: EmailSentEvent) {
        //Handle and process email sent event here
        console.log("-------event works ----------")
        console.log(event);
        console.log("-------event works ----------")

    }
}