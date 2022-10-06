import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { env } from "src/configuration";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { ActivityAction } from "src/core/dtos/activity";
import { ICreateP2pAd, ICreateP2pAdBank, IGetP2pAdBank, IGetP2pAds, IUpdateP2pAds } from "src/core/dtos/p2p";
import { IActivity } from "src/core/entities/Activity";
import { INotification } from "src/core/entities/notification.entity";
import { P2pAdsType } from "src/core/entities/P2pAds";
import { ResponseState } from "src/core/types/response";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { P2P_CHANNEL_LINK_DEVELOPMENT, P2P_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { UtilsServices } from "../../utils/utils.service";
import { P2pAdBankFactoryService, P2pFactoryService } from "./p2p-factory.service";

@Injectable()
export class P2pServices {

  constructor(
    private data: IDataServices,
    private discord: INotificationServices,
    private readonly utils: UtilsServices,
    private readonly p2pAdsFactory: P2pFactoryService,
    private readonly p2pAdsBankFactory: P2pAdBankFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async createAds(payload: ICreateP2pAd) {
    try {
      const { userId, type, coin, totalAmount, kyc, moreThanDot1Btc, registeredZeroDaysAgo } = payload
      let p2pId

      const wallet = await this.data.wallets.findOne({ coin, userId })
      if (!wallet) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Wallet does not exists',
          error: null
        })
      }
      const balance = Math.abs(Number(wallet.balance))
      const counterPartConditions = { kyc, moreThanDot1Btc, registeredZeroDaysAgo }

      const adExists = await this.data.p2pAds.findOne({ userId, type, coin }) // check if ad exists
      if (adExists) {
        await this.editAds({ id: adExists._id, ...payload })
        return {
          message: `Buy ads added processing`,
          data: payload,
          status: HttpStatus.ACCEPTED,
          state: ResponseState.SUCCESS,
        };
      }
      const activity: IActivity = {
        userId,
        action: type === P2pAdsType.SELL ? ActivityAction.P2P_SELL_AD : ActivityAction.P2P_BUY_AD,
        description: `Created P2P ${type} Ad`
      }
      const notification: INotification = {
        userId,
        title: `Created P2P ${type} Ad`,
        message: `Ad created successfully`
      }

      if (type === P2pAdsType.BUY) {
        const factory = await this.p2pAdsFactory.create({ ...payload, counterPartConditions })
        const ad = await this.data.p2pAds.create(factory)
        p2pId = ad._id
        await Promise.all([
          this.discord.inHouseNotification({
            title: `Created P2P ${type}  :- ${env.env} environment`,
            message: `
              P2P Ad Created
  
              Ad ID:- ${p2pId}
  
        `,
            link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
          }),
          this.utils.storeActivitySendNotification({ activity, notification })

        ])

        return {
          message: `Buy ads created successfully`,
          data: payload,
          status: HttpStatus.OK,
          state: ResponseState.SUCCESS,
        };
      }
      // check balance
      if (totalAmount >= balance) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Insufficient balance',
          error: null
        })
      }
      // deduct from wallet
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const factory = await this.p2pAdsFactory.create({ ...payload, counterPartConditions })
          const [, ad] = await Promise.all([
            this.data.wallets.update(
              {
                _id: wallet._id,
              },
              {
                $inc: {
                  balance: -totalAmount,
                },
                lastWithdrawal: totalAmount,
                lockedBalance: totalAmount,
              },
              session
            ),
            this.data.p2pAds.create(factory, session)
          ])
          p2pId = ad._id

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }


      await Promise.all([
        databaseHelper.executeTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `Created P2P ${type}  :- ${env.env} environment`,
          message: `
            P2P Ad Created

            Ad ID:- ${p2pId}

      `,
          link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
        }),
        this.utils.storeActivitySendNotification({ activity, notification })
      ])

      return {
        message: `${payload.type} ads created successfully`,
        data: {},
        status: HttpStatus.CREATED,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  cleanQueryPayload(payload: IGetP2pAds) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.isPublished) key['isPublished'] = payload.isPublished
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.type) key['type'] = payload.type
    if (payload.coin) key['coin'] = payload.coin


    return key
  }

  cleanBankPayload(payload: IGetP2pAdBank) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.isAcceptingToPaymentTo) key['isAcceptingToPaymentTo'] = payload.isAcceptingToPaymentTo
    if (payload.isWillingToPayTo) key['isWillingToPayTo'] = payload.isWillingToPayTo


    return key
  }
  async getAllAds(payload: IGetP2pAds) {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.p2pAds.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Ads retrieved successfully",
        status: 200,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getSingleAd(id: mongoose.Types.ObjectId) {
    try {

      const data = await this.data.p2pAds.findOne({ _id: id });
      return Promise.resolve({
        message: "Ad retrieved succesfully",
        status: 200,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async editAds(payload: IUpdateP2pAds) {
    try {
      const counterPartConditions = { kyc: payload.kyc, moreThanDot1Btc: payload.moreThanDot1Btc, registeredZeroDaysAgo: payload.registeredZeroDaysAgo }

      await this.data.p2pAds.update({ _id: payload.id }, { ...payload, counterPartConditions })
      return {
        message: `${payload.type} ads updated successfully`,
        data: {},
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async createAdsBank(payload: ICreateP2pAdBank) {
    try {
      const { accountNumber, userId } = payload
      console.log(userId)
      const bankExists = await this.data.p2pAdBanks.findOne({ userId, accountNumber })
      if (bankExists) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Bank does not exists',
          error: null
        })
      }
      const factory = await this.p2pAdsBankFactory.create(payload)
      const data = await this.data.p2pAdBanks.create(factory)

      return {
        message: `Bank added successfully`,
        data,
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
      };

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getAllAdsBank(payload: IGetP2pAdBank) {
    try {
      const cleanedPayload = this.cleanBankPayload(payload)
      const { data, pagination } = await this.data.p2pAdBanks.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Bank retrieved successfully",
        status: 200,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getSingleAdBank(id: mongoose.Types.ObjectId) {
    try {

      const data = await this.data.p2pAdBanks.findOne({ _id: id });
      return Promise.resolve({
        message: "Bank retrieved succesfully",
        status: 200,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async disableAdsBank(id: mongoose.Types.ObjectId) {
    try {

      const data = await this.data.p2pAdBanks.update({ _id: id }, { isActive: false });
      return Promise.resolve({
        message: "Bank disabled succesfully",
        status: 200,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}

