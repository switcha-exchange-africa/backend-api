import { Processor, OnQueueActive, Process, OnGlobalQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { env } from 'src/configuration';
import { WalletServices } from 'src/services/use-cases/wallet/wallet-services.services';



@Processor(`${env.env}.wallet`)
export class CreateWalletTaskConsumer {
  constructor(
    private walletService: WalletServices,

  ) { }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process()
  async createWallet(job: Job) {
    try {
      const { coin, userId, email, fullName } = job.data
      await this.walletService.create({ coin, userId, email, fullName })
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
