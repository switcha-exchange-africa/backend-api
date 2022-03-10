import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailSentListener } from './listener/email.listener';
import { SmsSentListener } from './listener/sms.listener';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false
    }),
  ],
  providers: [EmailSentListener, SmsSentListener],

})
export class EventEmitterServiceModule { }