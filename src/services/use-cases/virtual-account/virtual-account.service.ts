import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { IDepositVirtualAccount, IGetVirtualAccounts } from "src/core/dtos/virtual-account";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { Status } from "src/core/types/status";
import { UtilsServices } from "../utils/utils.service";
import { DepositAddressFactoryService } from "./virtual-account.factory";
import { VirtualAccountLib } from "./virtual-acount.lib";

@Injectable()
export class VirtualAccountServices {
    constructor(
        private readonly data: IDataServices,
        private readonly depositAddressFactory: DepositAddressFactoryService,
        private readonly lib: VirtualAccountLib,
        // private readonly utils: UtilsServices,
        // private readonly transactionFactory: TransactionFactoryService,
        // private readonly withdrawalFactory: WithdrawalFactoryService,
        // private readonly notificationFactory: NotificationFactoryService,
        // private readonly activityFactory: ActivityFactoryService,
        // private readonly discord: INotificationServices,
        // private readonly http: IHttpServices,
        private readonly utilsService: UtilsServices,
        // @InjectConnection() private readonly connection: mongoose.Connection

    ) { }


    cleanQueryPayload(payload: IGetVirtualAccounts) {
        let key = {}
        if (payload.userId) key['userId'] = payload.userId
        if (payload.perpage) key['perpage'] = payload.perpage
        if (payload.page) key['page'] = payload.page
        if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
        if (payload.dateTo) key['dateTo'] = payload.dateTo
        if (payload.sortBy) key['sortBy'] = payload.sortBy
        if (payload.orderBy) key['orderBy'] = payload.orderBy
        if (payload.accountId) key['accountId'] = payload.accountId
        if (payload.coin) key['coin'] = payload.coin
        if (payload.pendingTransactionSubscriptionId) key['pendingTransactionSubscriptionId'] = payload.pendingTransactionSubscriptionId
        if (payload.incomingTransactionSubscriptionId) key['incomingTransactionSubscriptionId'] = payload.incomingTransactionSubscriptionId
        if (payload.withdrawalTransactionSubscriptionId) key['withdrawalTransactionSubscriptionId'] = payload.withdrawalTransactionSubscriptionId
        if (payload.active) key['active'] = payload.active
        if (payload.frozen) key['frozen'] = payload.frozen

        return key
    }
    async getAllVirtualAccounts(payload: IGetVirtualAccounts) {
        try {
            const { q, perpage, page, dateFrom, dateTo, sortBy, orderBy } = payload
            if (q) {
                const { data, pagination } = await this.data.virtualAccounts.search({
                    query: {
                        q,
                        perpage,
                        page,
                        dateFrom,
                        dateTo,
                        sortBy,
                        orderBy,
                    }
                })
                return {
                    status: 200,
                    message: "Virtual account retrieved successfully",
                    data,
                    pagination,
                };
            }
            const cleanedPayload = this.cleanQueryPayload(payload)
            const { data, pagination } = await this.data.virtualAccounts.findAllWithPagination({
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
                message: "Transaction retrieved successfully",
                status: 200,
                data,
                pagination,
            });

        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'GET VIRTUAL ACCOUNTS',
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

    async getSingleVirtualAccount(payload: { id: Types.ObjectId, email: string }) {
        const { id, email } = payload
        try {

            const data = await this.data.virtualAccounts.findOne({ _id: id });
            return Promise.resolve({
                message: "Virtual acocunt retrieved succesfully",
                status: 200,
                data,
            });

        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'GET SINGLE VIRTUAL ACCOUNTS',
                error,
                email,
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


    async deposit(payload: IDepositVirtualAccount) {
        const { email, id, coin, userId } = payload
        try {
            const coinExists = await this.data.coins.findOne({ coin: coin.toUpperCase() })
            if (!coinExists) {
                return Promise.reject({
                    status: HttpStatus.NOT_FOUND,
                    state: ResponseState.ERROR,
                    error: null,
                    message: `Don't support ${coin}`
                })
            }
            const virtualAccount = await this.data.virtualAccounts.findOne({ _id: id, coin, userId })
            if (!virtualAccount) {
                return Promise.reject({
                    status: HttpStatus.NOT_FOUND,
                    state: ResponseState.ERROR,
                    error: null,
                    message: `${coin} wallet does not exists`
                })
            }
            const hasPendingAddress = await this.data.depositAddresses.findOne({ virtualAccountId: virtualAccount.accountId, coin, userId, status: Status.PENDING })
            if (hasPendingAddress) {
                return {
                    status: HttpStatus.OK,
                    data: {
                        address: hasPendingAddress.address,
                        coin
                    },
                    state: ResponseState.SUCCESS,
                    message: 'Address generated successfully'
                }
            }
            const address = await this.lib.generateDepositAddress(virtualAccount.accountId, coin)
            const factory = await this.depositAddressFactory.create({
                virtualAccountId: virtualAccount.accountId,
                status: Status.PENDING,
                coin,
                userId,
                derivationKey: address.derivationKey,
                address: address.address,
                metaData: address
            })
            const data = await this.data.depositAddresses.create(factory)
            return {
                status: HttpStatus.CREATED,
                data: {
                    address: data.address,
                    coin
                },
                state: ResponseState.SUCCESS,
                message: 'Address generated successfully'
            }

        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'DEPOSIT TO VIRTUAL ACCOUNTS',
                error,
                email,
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

    async getVirtualAccountDepositAddress(payload: { accountId: string, coin: string, email: string, userId: string }) {
        const { accountId, email, coin, userId } = payload
        try {
            const { address } = await this.data.depositAddresses.findOne({ coin, accountId, userId });

            return Promise.resolve({
                message: "Address retrieved succesfully",
                status: 200,
                data: {
                    address,
                    coin
                },
            });

        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'GET DEPOSIT ADDRESS',
                error,
                email,
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