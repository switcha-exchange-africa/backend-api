
import { Processor, OnQueueActive, Process, OnGlobalQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { API_URL, TATUM_API_KEY, TATUM_BASE_URL } from 'src/configuration';
import { IHttpServices } from 'src/core/abstracts/http-services.abstract';



const CONFIG = {
  headers: {
    "X-API-Key": TATUM_API_KEY
  },
};
@Processor('wallet.webhook.subscription')
export class WalletWebhookSubscriptionConsumer {
  constructor(
    private http: IHttpServices,

  ) { }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process()
  async subscribe(job: Job) {
    try {
      const { chain, address } = job.data
      await this.http.post(`${TATUM_BASE_URL}/subscription`,
        {
          type: "ADDRESS_TRANSACTION",
          attr: {
            address,
            chain: chain,
            url: `${API_URL}/api/webhook/tatum`,
          },
        },
        CONFIG
      )
    } catch (e) {
      Logger.error(e)
    }

  }
  @OnGlobalQueueCompleted()
  async onGlobalCompleted(job: Job<unknown>, result: any) {
    console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, err: Error) {
    console.log('JOB ID ', job.id);
    console.log(err)
  }

}
