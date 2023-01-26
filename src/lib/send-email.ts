// import { Logger } from '@nestjs/common';
// import { NODEMAILER_EMAIL_HOST, NODEMAILER_EMAIL_PASSWORD, NODEMAILER_EMAIL_PORT, NODEMAILER_EMAIL_USER, NODEMAILER_FROM_EMAIL } from 'src/configuration';
// import * as nodemailer from 'nodemailer';
// import { EMAIL_PAYLOAD_TYPE } from 'src/services/use-cases/event-emitter/event/email.event';


// export const sendMail = async (payload: EMAIL_PAYLOAD_TYPE) => {

//   try {
//     // // create reusable transporter object using the default SMTP transport
//     // const transporter = nodemailer.createTransport({
//     //   host: NODEMAILER_EMAIL_HOST,
//     //   port: parseInt(NODEMAILER_EMAIL_PORT),
//     //   secure: true, // true for 465, false for other ports
//     //   auth: {
//     //     user: NODEMAILER_EMAIL_USER,
//     //     pass: NODEMAILER_EMAIL_PASSWORD,
//     //   },
//     // });

//     // // send mail with defined transport object
//     // const info = await transporter.sendMail({
//     //   from: NODEMAILER_FROM_EMAIL, // sender address
//     //   to: payload.to, // list of receivers
//     //   subject: payload.subject, // Subject line
//     //   html: payload.html, // html body
//     // });

//     // Logger.log("Message sent: %s", info.messageId);
//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
//   } catch (e) {
//     Logger.error('@send-email', e)
//   }

// }