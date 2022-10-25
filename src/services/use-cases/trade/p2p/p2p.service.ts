import { InjectQueue } from "@nestjs/bull";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Queue } from "bull";
import * as mongoose from "mongoose";
import { env } from "src/configuration";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { ActivityAction } from "src/core/dtos/activity";
import {
  ICreateP2pAd, ICreateP2pAdBank, ICreateP2pOrder, IGetP2pAdBank, IGetP2pAds, IGetP2pBanks, IP2pConfirmOrder, IUpdateP2pAds, P2pOrderType,
  // P2pOrderType
} from "src/core/dtos/p2p";
import { IActivity } from "src/core/entities/Activity";
import { INotification } from "src/core/entities/notification.entity";
import { P2pAds, P2pAdsType } from "src/core/entities/P2pAds";
import { P2pOrder } from "src/core/entities/P2pOrder";
import { CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { User } from "src/core/entities/user.entity";
import { ResponseState } from "src/core/types/response";
import { Status } from "src/core/types/status";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { P2P_CHANNEL_LINK_DEVELOPMENT, P2P_CHANNEL_LINK_PRODUCTION, THREE_MIN_IN_SECONDS } from "src/lib/constants";
import {
  compareHash,
  // compareHash,
  generateReference, hash, isEmpty, randomFixedInteger
} from "src/lib/utils";
import { UtilsServices } from "../../utils/utils.service";
import { P2pAdBankFactoryService, P2pFactoryService, P2pOrderFactoryService } from "./p2p-factory.service";
import * as _ from 'lodash'
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { CoinType } from "src/core/types/coin";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { IErrorReporter } from "src/core/types/error";
@Injectable()
export class P2pServices {

  constructor(
    private readonly data: IDataServices,
    private readonly discord: INotificationServices,
    private readonly utils: UtilsServices,
    private readonly p2pAdsFactory: P2pFactoryService,
    private readonly p2pAdsBankFactory: P2pAdBankFactoryService,
    private readonly orderFactory: P2pOrderFactoryService,
    private readonly inMemoryServices: IInMemoryServices,
    private readonly discordServices: INotificationServices,
    private readonly transactionFactory: TransactionFactoryService,
    private readonly notificationFactory: NotificationFactoryService,
    private readonly utilsService: UtilsServices,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectQueue(`${env.env}.order.expiry`) private orderQueue: Queue,

  ) { }

  async calculateP2pFees(payload: {
    feature: string,
    amount: number
  }) {
    try {
      const { feature, amount } = payload
      const getFee = await this.data.fees.findOne({ feature, amountType: 'percentage' })

      const feePercent = _.divide(getFee.amountInPercentage, 100)
      const fee = _.floor(_.multiply(feePercent, amount), 3)

      const amountAfterFee = Math.abs(Number(_.subtract(amount, fee)))
      return { fee, amountAfterFee }

    } catch (error) {
      throw new Error(error)
    }
  }
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
      const userManagement = await this.data.userFeatureManagement.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (!userManagement) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Service not available to you`,
          error: null
        })
      }
      if (type === 'buy' && !userManagement.canP2PBuy) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      if (type === 'sell' && !userManagement.canP2PSell) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      // const adExists = await this.data.p2pAds.findOne({ userId, type, coin }) // check if ad exists
      // if (adExists) {
      //   await this.editAds({ id: adExists._id, ...payload })
      //   return {
      //     message: `Buy ads added processing`,
      //     data: payload,
      //     status: HttpStatus.ACCEPTED,
      //     state: ResponseState.SUCCESS,
      //   };
      // }
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

        const atomicTransaction = async (session: mongoose.ClientSession) => {
          try {
            const ad = await this.data.p2pAds.create(factory, session)
            p2pId = ad._id
            await this.data.users.update({ _id: userId }, {
              $inc: {
                noOfP2pAdsCreated: 1,
              }
            }, session)

          } catch (error) {
            Logger.error(error);
            throw new Error(error);
          }
        }
        await databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        )
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
          await this.data.wallets.update(
            {
              _id: wallet._id,
            },
            {
              $inc: {
                balance: -totalAmount,
                lockedBalance: totalAmount,
              },
              lastWithdrawal: totalAmount,
            },
            session
          )
          await this.data.users.update({ _id: userId }, {
            $inc: {
              noOfP2pAdsCreated: 1,
            }
          }, session)

          const ad = await this.data.p2pAds.create(factory, session)

          p2pId = ad._id

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
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
        message: `Sell ads created successfully`,
        data: {},
        status: HttpStatus.CREATED,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CREATE P2P ADS',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
    if (payload.isSwitchaMerchant) key['isSwitchaMerchant'] = payload.isSwitchaMerchant
    return key
  }
  cleanP2pBankQueryPayload(payload: IGetP2pBanks) {
    let key = {}
    if (payload.accountNumber) key['accountNumber'] = payload.accountNumber
    if (payload.isActive) key['isActive'] = payload.isActive
    if (payload.isWillingToPayTo) key['isWillingToPayTo'] = payload.isWillingToPayTo
    if (payload.isAcceptingToPaymentTo) key['isAcceptingToPaymentTo'] = payload.isAcceptingToPaymentTo
    if (payload.userId) key['userId'] = payload.userId
    if (payload.type) key['type'] = payload.type

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
    if (payload.type) key['type'] = payload.type



    return key
  }
  async getAllAds(payload: IGetP2pAds) {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.p2pAds.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: ['user', 'bank']
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
      const errorPayload: IErrorReporter = {
        action: 'GET P2P ADS',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE P2P AD',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const errorPayload: IErrorReporter = {
        action: 'EDIT P2P ADS',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const bankExists = await this.data.p2pAdBanks.findOne({ userId, accountNumber })
      if (bankExists) {
        return Promise.reject({
          status: HttpStatus.CONFLICT,
          state: ResponseState.ERROR,
          message: 'Bank already exists',
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
      const errorPayload: IErrorReporter = {
        action: 'CREATE AD BANK',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const errorPayload: IErrorReporter = {
        action: 'GET ALL ADS BANK',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE AD BANK',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
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
      const errorPayload: IErrorReporter = {
        action: 'DISABLE ADS BANK',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async createP2pOrder(payload: ICreateP2pOrder) {
    try {
      //
      const { adId, clientId, quantity, clientAccountName, clientAccountNumber, clientBankName, type, bankId } = payload
      const userManagement = await this.data.userFeatureManagement.findOne({ userId: new mongoose.Types.ObjectId(clientId) })
      if (!userManagement) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Service not available to you`,
          error: null
        })
      }
      if (type === 'buy' && !userManagement.canP2PSell) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      if (type === 'sell' && !userManagement.canP2PBuy) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }
      const ad = await this.data.p2pAds.findOne({ _id: adId })
      if (!ad) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Ad does not exists',
          error: null
        })
      }
      if (ad.status === Status.FILLED) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Ad has been filled',
          error: null
        })
      }
      const merchant = await this.data.users.findOne({ _id: ad.userId, lock: false })  // add creator
      if (quantity > ad.totalAmount) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `Not enough ${ad.coin} in ad`,
          error: null
        })
      }

      if (quantity < ad.minLimit || quantity > ad.maxLimit) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Quantity is more  or less than limit',
          error: null
        })
      }

      if (!merchant || merchant.lock) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Something wrong with Merchant account, please do not continue with this merchant',
          error: null
        })
      }
      if (String(merchant._id) === clientId) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `Merchant cannot interact with his ad`,
          error: null
        })
      }
      // criteria conditions
      let order, clientWallet

      if (ad.type === P2pAdsType.BUY) {
        // check if seller has wallet and enough coin
        clientWallet = await this.data.wallets.findOne({ userId: clientId, coin: ad.coin })
        if (!clientWallet) {
          return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `Please create a ${ad.coin.toUpperCase()} wallet before interacting with trade`,
            error: null
          })
        }
        if (ad.minLimit >= clientWallet.balance) {
          return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `Insufficient balance in your ${ad.coin.toUpperCase()} balance to sell`,
            error: null
          })
        }
      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const orderPayload = {
            merchantId: String(merchant._id),
            clientId,
            adId,
            type,
            quantity,
            bankId,
            status: Status.PENDING,
            clientAccountName,
            clientAccountNumber,
            clientBankName,
            price: ad.price,
            clientWalletId: clientWallet ? String(clientWallet._id) : null,
            totalAmount: Math.abs(Number(ad.price)) * Math.abs(Number(quantity))
          }

          const factory = await this.orderFactory.create(orderPayload)
          order = await this.data.p2pOrders.create(factory, session)

          await this.data.p2pAds.update({ _id: ad._id }, {
            $inc: {
              totalAmount: -quantity
            }
          }, session) // deduct quantity from ad
          if (ad.type === P2pAdsType.BUY) {
            // check if seller has wallet and enough coin
            await this.data.wallets.update(
              { userId: clientId, coin: ad.coin }, {
              $inc: {
                balance: -quantity,
                lockedBalance: quantity
              }
            }, session)

          }

          await this.data.users.update({ _id: clientId }, {
            $inc: {
              noOfP2pOrderCreated: 1,
            }
          }, session)


        }
        catch (error) {
          Logger.error(error);
          return Promise.reject(error)
        }
      }

      // try{}
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      // create queue
      const activity: IActivity = {
        userId: clientId,
        action: type === P2pOrderType.SELL ? ActivityAction.P2P_SELL : ActivityAction.P2P_BUY,
        description: `Created P2P ${type} Order`
      }
      const notification: INotification = {
        userId: String(merchant._id),
        title: `Order created`,
        message: `Order created successfully for your ad, order id ${order.orderId}`
      }
      await this.utils.storeActivitySendNotification({ activity, notification })

      await this.orderQueue.add({ id: order._id }, {
        delay: Math.abs(Number(ad.paymentTimeLimit)) * 60000
      })


      return Promise.resolve({
        message: "Order created succesfully",
        status: HttpStatus.OK,
        data: {
          order,
          timeInMin: Math.abs(Number(ad.paymentTimeLimit)),
          timeInMiliSeconds: Math.abs(Number(ad.paymentTimeLimit)) * 60000,
          timeInSeconds: Math.abs(Number(ad.paymentTimeLimit)) * 60
        },
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CREATE P2P ORDER',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }


  async confirmP2pOrder(payload: IP2pConfirmOrder) {
    try {
      const { orderId, userId, code, email } = payload
      const order = await this.data.p2pOrders.findOne({ _id: orderId })
      if (!order) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Order does not exists',
          error: null
        })
      }
      if (order.status !== Status.PENDING) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Order already processed or expired',
          error: null
        })
      }
      const [ad, merchant, client] = await Promise.all([
        this.data.p2pAds.findOne({ _id: order.adId }),
        this.data.users.findOne({ _id: order.merchantId }),
        this.data.users.findOne({ _id: order.clientId }),
      ])

      if (ad.type === P2pAdsType.BUY && order.clientId !== userId) {
        // order client id must be the logged in user
        return Promise.reject({
          status: HttpStatus.FORBIDDEN,
          state: ResponseState.ERROR,
          message: `Forbidden to take this action`,
          error: null
        })
      }

      if (ad.type === P2pAdsType.SELL && order.merchantId !== userId) {
        // order client id must be the logged in user
        return Promise.reject({
          status: HttpStatus.FORBIDDEN,
          state: ResponseState.ERROR,
          message: `Forbidden to take this action`,
          error: null
        })
      }
      const redisKey = `${order._id}-confirm-${userId}`
      // await this.inMemoryServices.del(redisKey)
      if (isEmpty(code)) {
        // send code to user phone number
        const verificationCode = randomFixedInteger(6)
        const hashedCode = await hash(String(verificationCode))
        await Promise.all([
          this.discordServices.inHouseNotification({
            title: `P2p Order Confirm Release Verification code :- ${env.env} environment`,
            message: `
              P2p Confirm Verification code for user ${email} :- ${verificationCode}

            `,
            link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
          }),
          this.inMemoryServices.set(redisKey, hashedCode, String(THREE_MIN_IN_SECONDS))

        ])
        return {
          message: "Verification code sent to your email",
          status: HttpStatus.ACCEPTED,
          data: env.isProd ? null : verificationCode,
        }
      }
      // check verification code
      const savedCode = await this.inMemoryServices.get(redisKey);
      if (isEmpty(savedCode)) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Code is incorrect, invalid or has expired',
        error: null,
      })

      const correctCode = await compareHash(String(code).trim(), (savedCode || '').trim())
      if (!correctCode) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Code is incorrect, invalid or has expired',
        error: null,
      })

      if (ad.type === P2pAdsType.BUY) {
        // order client id must be the logged in user
        return this.processClientP2pOrder({
          client,
          order,
          ad
        })
      }
      return this.processMerchantP2pOrder({
        merchant,
        order,
        redisKey,
        ad
      })
      // update order status
      // release coins
      // set order status to completed
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
  async processClientP2pOrder(payload: {
    client: mongoose.HydratedDocument<User>,
    order: mongoose.HydratedDocument<P2pOrder>,
    ad: mongoose.HydratedDocument<P2pAds>
  }) {
    try {

      const { client, order, ad } = payload
      const clientWallet = await this.data.wallets.findOne({ coin: ad.coin, userId: String(client._id) })
      if (!clientWallet) {
        Logger.error('Client wallet does not exist')
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          error: null,
          message: 'Client wallet does not exist'
        })
      }

      const buyerWallet = await this.data.wallets.findOne({ coin: ad.coin, userId: String((ad.userId as unknown as mongoose.HydratedDocument<User>)._id) }, null, { populate: ['userId'] })
      if (!buyerWallet) {
        Logger.error('Buyer wallet does not exist')
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          error: null,
          message: 'Buyer wallet does not exist'
        })
      }
      const { fee, amountAfterFee } = await this.calculateP2pFees({ feature: 'p2p-sell', amount: order.quantity })

      const buyerAmount: number = amountAfterFee
      const buyer = buyerWallet?.userId! as unknown as User

      const feeWallet = await this.data.feeWallets.findOne({ coin: ad.coin })
      if (!feeWallet) {
        Logger.error('Fee Wallet not set')
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          error: null,
          message: 'Service unavailable'
        })
      }
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const generalTransactionReference = generateReference('general')
          const creditedBuyerWallet = await this.data.wallets.update(
            { _id: buyerWallet._id }, {
            $inc: {
              balance: buyerAmount
            },
            lastDeposit: buyerAmount
          }, session)// credit merchant wallet
          const creditedFeeWallet = await this.data.feeWallets.update(
            { _id: feeWallet._id }, {
            $inc: {
              balance: fee
            },
            lastDeposit: fee
          }, session)// credit switcha fee wallet
          const deductAdTotalAmount = await this.data.p2pAds.update({ _id: ad._id }, {
            $inc: {
              totalAmount: -order.quantity
            }
          }, session)// deduct ad totalAmount 
          await this.data.wallets.update({ _id: clientWallet._id }, {
            $inc: {
              lockedBalance: -order.quantity
            }
          }, session) // release locked balance 

          const clientTransactionPayload = {
            userId: String(client._id),
            walletId: String(order.clientWalletId),
            currency: ad.coin as CoinType,
            amount: order.quantity,
            signedAmount: -order.quantity,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Sold ${order.quantity} ${ad.coin} to ${buyer.username}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: clientWallet?.balance,
            balanceBefore: _.add(clientWallet.balance, clientWallet.lockedBalance) || 0,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('debit'),
          }
          const merchantTransactionPayload = {
            userId: ad.userId,
            walletId: String(buyerWallet._id),
            currency: ad.coin as CoinType,
            amount: buyerAmount,
            signedAmount: buyerAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Recieved ${buyerAmount} ${ad.coin} from ${client.username}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedBuyerWallet.balance,
            balanceBefore: buyerWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('credit'),
          }

          const feeTransactionPayload = {
            feeWalletId: String(buyerWallet._id),
            currency: ad.coin as CoinType,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `P2p Order:- Charged ${fee} ${ad.coin}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedFeeWallet.balance,
            balanceBefore: feeWallet?.balance,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('credit'),
          }

          const clientNotificationPayload: INotification = {
            userId: String(client._id),
            title: `Order confirmed #${order._id}`,
            message: clientTransactionPayload.description
          }
          const merchantNotificationPayload: INotification = {
            userId: buyerWallet.userId,
            title: `Order confirmed #${order._id}`,
            message: merchantTransactionPayload.description
          }

          const [clientTransactionFactory, merchantTransactionFactory, feeTransactionFactory, clientNotificationFactory, merchantNotificationFactory] = await Promise.all([
            this.transactionFactory.create(clientTransactionPayload),
            this.transactionFactory.create(merchantTransactionPayload),
            this.transactionFactory.create(feeTransactionPayload),
            this.notificationFactory.create(clientNotificationPayload),
            this.notificationFactory.create(merchantNotificationPayload),
          ])


          await this.data.transactions.create(clientTransactionFactory, session)
          await this.data.transactions.create(merchantTransactionFactory, session)
          await this.data.transactions.create(feeTransactionFactory, session)
          await this.data.notifications.create(clientNotificationFactory, session)
          await this.data.notifications.create(merchantNotificationFactory, session)

          await this.data.users.update({ _id: clientTransactionPayload.userId }, {
            $inc: {
              noOfP2pOrderCompleted: 1,
            }
          }, session)
          await this.data.users.update({ _id: merchantTransactionPayload.userId }, {
            $inc: {
              noOfP2pOrderCompleted: 1,
            }
          }, session)
          await this.data.p2pOrders.update({ _id: order._id }, { status: Status.COMPLETED }, session),
            deductAdTotalAmount.balance === 0 ?
              await this.data.p2pAds.update({ _id: ad._id }, { status: Status.FILLED }, session) :
              await this.data.p2pAds.update({ _id: ad._id }, { status: Status.PARTIAL }, session)


        } catch (error) {
          throw new Error(error)
        }
      }

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      await this.discord.inHouseNotification({
        title: `Order Confirmed  :- ${env.env} environment`,
        message: `

          Order ID:- ${order._id}

          Confirmed By:- ${client.username ? client.username : client.email}  -${client.email}

          Amount Sold:- ${order.quantity} ${ad.coin}

          Amount Transferred To Merchant:- ${buyerAmount} ${ad.coin}

          Buyer :- ${buyer.username ? buyer.username : buyer.email}

          Fee :- ${fee} ${feeWallet.coin}
    `,
        link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
      })
      return {
        message: "Order confirmed succesfully",
        status: HttpStatus.OK,
        data: {},
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async processMerchantP2pOrder(payload: {
    merchant: mongoose.HydratedDocument<User>,
    order: mongoose.HydratedDocument<P2pOrder>,
    ad: mongoose.HydratedDocument<P2pAds>,
    redisKey: string
  }) {
    try {
      const { merchant, order, ad, redisKey } = payload
      const { coin } = ad


      const merchantWallet = await this.data.wallets.findOne({ coin, userId: String(merchant._id) })
      const buyer = await this.data.users.findOne({ _id: order.clientId })
      if (!buyer) {
        Logger.error('Buyer does not exists')
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          error: null,
          message: 'Buyer does not exists',
          state: ResponseState.ERROR
        })
      }

      const buyerWallet = await this.data.wallets.findOne({ userId: String(buyer._id), coin })
      if (!buyerWallet) {
        Logger.error('Buyer wallet does not exists')
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          error: null,
          message: 'Buyer wallet does not exists',
          state: ResponseState.ERROR
        })
      }
      const { fee, amountAfterFee } = await this.calculateP2pFees({ feature: 'p2p-buy', amount: order.quantity })
      const buyerAmount = amountAfterFee
      const feeWallet = await this.data.feeWallets.findOne({ coin: ad.coin })
      if (!feeWallet) {
        Logger.error("FEE WALLET DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: null,
          message: 'Service unavailable'
        })
      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const generalTransactionReference = generateReference('general')

          const creditedBuyerWallet = await this.data.wallets.update({ _id: buyerWallet._id }, {
            $inc: {
              balance: buyerAmount
            },
            lastDeposit: buyerAmount
          }, session)
          const creditedFeeWallet = await this.data.feeWallets.update({ _id: feeWallet._id }, {
            $inc: {
              balance: fee
            },
            lastDeposit: fee
          }, session)

          const deductAdTotalAmount = await this.data.p2pAds.update({ _id: ad._id }, {
            $inc: {
              totalAmount: -order.quantity
            }
          }, session)
          await this.data.wallets.update({ _id: merchantWallet._id }, {
            $inc: {
              lockedBalance: -order.quantity
            }
          }, session)


          const merchantTransactionPayload = {
            userId: String(merchant._id),
            walletId: String(merchantWallet._id),
            currency: coin as CoinType,
            amount: order.quantity,
            signedAmount: -order.quantity,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Sold ${order.quantity} ${ad.coin} to ${buyer.username}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: merchantWallet?.balance,
            balanceBefore: _.add(merchantWallet?.balance, ad.totalAmount),
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('credit'),
          }
          const buyerTransactionPayload = {
            userId: String(buyer._id),
            walletId: String(buyerWallet._id),
            currency: coin as CoinType,
            amount: buyerAmount,
            signedAmount: buyerAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Recieved ${buyerAmount} ${ad.coin} from ${merchant.username}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedBuyerWallet.balance,
            balanceBefore: buyerWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('credit'),
          }
          const feeTransactionPayload = {
            feeWalletId: String(merchantWallet._id),
            currency: ad.coin as CoinType,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `P2p Order:- Charged ${fee} ${ad.coin}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedFeeWallet.balance,
            balanceBefore: feeWallet?.balance,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.P2P,
            generalTransactionReference,
            p2pAdId: String(ad._id),
            p2pOrderId: String(order._id),
            reference: generateReference('credit'),
          }

          const buyerNotificationPayload: INotification = {
            userId: String(buyer._id),
            title: `Order confirmed #${order._id}`,
            message: buyerTransactionPayload.description
          }
          const merchantNotificationPayload: INotification = {
            userId: merchantWallet.userId,
            title: `Order confirmed #${order._id}`,
            message: merchantTransactionPayload.description
          }

          const [merchantTransactionFactory, buyerTransactionFactory, feeTransactionFactory, buyerNotificationFactory, merchantNotificationFactory] = await Promise.all([
            this.transactionFactory.create(merchantTransactionPayload),
            this.transactionFactory.create(buyerTransactionPayload),
            this.transactionFactory.create(feeTransactionPayload),
            this.notificationFactory.create(buyerNotificationPayload),
            this.notificationFactory.create(merchantNotificationPayload),
          ])


          await this.data.transactions.create(merchantTransactionFactory, session)
          await this.data.transactions.create(buyerTransactionFactory, session)
          await this.data.transactions.create(feeTransactionFactory, session)
          await this.data.notifications.create(buyerNotificationFactory, session)
          await this.data.notifications.create(merchantNotificationFactory, session)
          await this.data.p2pOrders.update({ _id: order._id }, { status: Status.COMPLETED }, session)
          deductAdTotalAmount.balance === 0 ?
            await this.data.p2pAds.update({ _id: ad._id }, { status: Status.FILLED }, session) :
            await this.data.p2pAds.update({ _id: ad._id }, { status: Status.PARTIAL }, session)


          await this.data.users.update({ _id: buyerTransactionPayload.userId }, {
            $inc: {
              noOfP2pOrderCompleted: 1,
            }
          }, session)
          await this.data.users.update({ _id: merchantTransactionPayload.userId }, {
            $inc: {
              noOfP2pOrderCompleted: 1,
            }
          }, session)

        } catch (error) {
          Logger.error(error)
          throw new Error(error)
        }
      }


      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      await this.discord.inHouseNotification({
        title: `Order Confirmed  :- ${env.env} environment`,
        message: `

            Order ID:- ${order._id}

            Confirmed By:- ${merchant.username ? merchant.username : merchant.email}

            Amount Sold:- ${order.quantity} ${coin}

            Amount Transferred To Buyer:- ${buyerAmount} ${coin}

            Buyer :- ${buyer.username ? buyer.username : buyer.email}

            Fee :- ${fee} ${feeWallet.coin}
      `,
        link: env.isProd ? P2P_CHANNEL_LINK_PRODUCTION : P2P_CHANNEL_LINK_DEVELOPMENT,
      })
      await this.inMemoryServices.del(redisKey)

      return {
        message: "Order confirmed succesfully",
        status: HttpStatus.OK,
        data: {},
      }
    } catch (error) {
      Logger.error(error)
      throw new Error(error)
    }
  }

  async getSingleP2pOrder(id: mongoose.Types.ObjectId) {
    try {
      const data = await this.data.p2pOrders.findOne({ _id: id })
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Order does not exists',
          error: null
        })
      }
      return Promise.resolve({
        message: "Order retrieved  succesfully",
        status: HttpStatus.OK,
        data,
      });
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE P2P ORDER',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}

