import { Processor, OnQueueActive, Process, OnGlobalQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { IDataServices, INotificationServices } from 'src/core/abstracts';
import { INotification } from 'src/core/entities/notification.entity';
import { Status } from 'src/core/types/status';
import * as mongoose from "mongoose";
import { NotificationFactoryService } from 'src/services/use-cases/notification/notification-factory.service';
import { InjectConnection } from '@nestjs/mongoose';
import databaseHelper from 'src/frameworks/data-services/mongo/database-helper';
import { P2pAdsType } from 'src/core/entities/P2pAds';
import { env } from 'src/configuration';
import { P2P_CHANNEL_LINK_DEVELOPMENT, P2P_CHANNEL_LINK_PRODUCTION } from 'src/lib/constants';



@Processor(`${env.env}.order.expiry`)
export class OrderExpiryTaskConsumer {
  constructor(
    private readonly data: IDataServices,
    private readonly notificationFactory: NotificationFactoryService,
    private readonly discordServices: INotificationServices,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection


  ) { }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process()
  async orderExpiry(job: Job) {
    try {
      const { id } = job.data
      const order = await this.data.p2pOrders.findOne({ _id: id })
      if (!order) {
        Logger.warn(`@task-queue`, 'P2p Order does not exists')
        return
      }
      const ad = await this.data.p2pAds.findOne({ _id: order.adId })


      if (order.status !== Status.PENDING) {
        Logger.warn(`@task-queue`, 'P2p Order not pending')
        return
      }
      // if (order.status === Status.DISPUTE) {
      //   Logger.warn(`@task-queue`, 'P2p Order being disputed')
      //   return
      // }

      if (!ad) {
        Logger.warn(`@task-queue`, 'P2p Ad does not exists')
        return
      }
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const merchantNotification: INotification = {
            userId: order.merchantId,
            title: `Order expired!!`,
            message: `Order has expired, other party fails to make payment within the stated time. ID ${order._id}`
          }
          const clientNotification: INotification = {
            userId: order.clientId,
            title: `Order expired!!`,
            message: `Order expired, please do not make any further interaction with trade. ID ${order._id}`
          }
          const [merchantNotificationFactory, clientNotificationFactory] = await Promise.all([
            this.notificationFactory.create(merchantNotification),
            this.notificationFactory.create(clientNotification),

          ])
          await this.data.p2pOrders.update({ _id: id }, {
            completionTime: new Date(),
            status: Status.EXPIRED,
          }, session)
          await this.data.p2pAds.update({ _id: ad._id }, {
            $inc: {
              totalAmount: order.quantity
            }
          }, session)
          await this.data.notifications.create(merchantNotificationFactory, session)
          await this.data.notifications.create(clientNotificationFactory, session)
          // await Promise.all([

          // ])
          if (ad.type === P2pAdsType.BUY) {
            // check if seller has wallet and enough coin
            await this.data.wallets.update(
              { userId: order.clientId, coin: ad.coin }, {
              $inc: {
                balance: order.quantity,
                lockedBalance: -order.quantity
              }
            }, session)

          }



        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      Logger.log('Task Queue completed')

      this.discordServices.inHouseNotification({
        title: `Order has expired :- ${env.env} environment`,
        message: `
          ORDER ID:- ${order.orderId}

          MERCHANT ID:- ${order.merchantId}

          CLIENT ID:- ${order.clientId}

          ORDER HAS EXPIRED
        `,
        link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
      })

    } catch (e) {
      Logger.error(e)
      throw new Error()
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
