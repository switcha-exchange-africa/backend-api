import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { sendMail } from "src/lib/send-email";
import { UtilsServices } from "src/services/use-cases/utils/utils.service";
import { EmailSentEvent } from "../event/email.event";

@Injectable()
export class EmailSentListener {
    constructor(
        private readonly utilsService: UtilsServices
    ) { }

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

    @OnEvent('send.email.mailjet')
    handleEmailSendEventWthMailjet(event: EmailSentEvent) {
        //Handle and process email sent event here
        const {
            fromEmail,
            fromName,
            toEmail,
            toName,
            templateId,
            subject,
            variables
        } = event


        this.utilsService.sendEmailUsingMailjet({
            fromEmail,
            fromName,
            toEmail,
            toName,
            templateId,
            subject,
            variables
        }).then((data) => console.log(data))
            .catch(error => Logger.error(JSON.stringify(error)))


    }

}