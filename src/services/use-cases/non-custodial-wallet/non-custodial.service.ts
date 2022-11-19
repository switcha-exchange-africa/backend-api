import { Injectable, HttpStatus, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { IDataServices } from "src/core/abstracts";
import { IGenerateNonCustodialWallet } from "src/core/dtos/non-custodial-wallet";
import { CoinType } from "src/core/types/coin";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { UtilsServices } from "../utils/utils.service";
import { VirtualAccountFactoryService } from "./non-custodial-factory.service";
import { NonCustodialWalletLib } from "./non-custodial.lib";

@Injectable()
export class NonCustodialWalletServices {
    constructor(
        private readonly data: IDataServices,
        private readonly virtualAccountFactory: VirtualAccountFactoryService,
        private readonly utilsService: UtilsServices,
        private readonly lib: NonCustodialWalletLib,
        private readonly emitter: EventEmitter2,

    ) { }


    async generateWallet(payload: IGenerateNonCustodialWallet) {
        const { email, coin, username, userId } = payload
        try {
            const [coinExists, user, virtualAccount] = await Promise.all([
                this.data.coins.findOne({ coin: coin.toUpperCase() }),
                this.data.users.findOne({ _id: userId }),
                this.data.virtualAccounts.findOne({ coin: coin.toUpperCase(), userId }),

            ])
            if (!coinExists) {
                return Promise.reject({
                    status: HttpStatus.NOT_FOUND,
                    state: ResponseState.ERROR,
                    message: 'Coin does not exists',
                    error: null
                })
            }
            if (virtualAccount) {
                return Promise.reject({
                    status: HttpStatus.CONFLICT,
                    state: ResponseState.ERROR,
                    message: `Already have ${coin} wallet`,
                    error: null
                })
            }
            if (!user) {
                return Promise.reject({
                    status: HttpStatus.NOT_FOUND,
                    state: ResponseState.ERROR,
                    message: 'User does not exists',
                    error: null
                })
            }
            if (!user.transactionPin) {
                return Promise.reject({
                    status: HttpStatus.BAD_REQUEST,
                    state: ResponseState.ERROR,
                    message: 'Transaction pin does not exists',
                    error: null
                })
            }
            if (!username) {
                return Promise.reject({
                    status: HttpStatus.BAD_REQUEST,
                    state: ResponseState.ERROR,
                    message: 'Please generate a username',
                    error: null
                })
            }
            if (coin === 'ETH') {

                const { account: cleanAccount, encrypted } = await this.lib.generateEthWallet({ username, userId, pin: user.transactionPin })
                const virtualAccountFactory = this.virtualAccountFactory.create({
                    coin: cleanAccount.currency as CoinType,
                    userId,
                    accountId: cleanAccount.id,
                    xpub: cleanAccount.xpub,
                    mnemonic: encrypted,
                    active: cleanAccount.active,
                    frozen: cleanAccount.frozen,
                })
                const data = await this.data.virtualAccounts.create(virtualAccountFactory)
                this.emitter.emit("send.webhook.subscription", {
                    accountId: data.accountId
                })
                return {
                    message: 'Wallet created successfully',
                    status: HttpStatus.CREATED,
                    data: {},
                    state: ResponseState.SUCCESS
                }
            }

            if (coin === 'USDT') {

                const { account: cleanAccount, encrypted } = await this.lib.generateERC20Wallet({ username, userId, pin: user.transactionPin, coin })
                const virtualAccountFactory = this.virtualAccountFactory.create({
                    coin: cleanAccount.currency as CoinType,
                    userId,
                    accountId: cleanAccount.id,
                    xpub: cleanAccount.xpub,
                    mnemonic: encrypted,
                    active: cleanAccount.active,
                    frozen: cleanAccount.frozen
                })
                const data = await this.data.virtualAccounts.create(virtualAccountFactory)
                this.emitter.emit("send.webhook.subscription", {
                    accountId: data.accountId
                })
                return {
                    message: 'Wallet created successfully',
                    status: HttpStatus.CREATED,
                    data: {},
                    state: ResponseState.SUCCESS
                }
            }

            if (coin === 'USDC') {

                const { account: cleanAccount, encrypted } = await this.lib.generateERC20Wallet({ username, userId, pin: user.transactionPin, coin })
                const virtualAccountFactory = this.virtualAccountFactory.create({
                    coin: cleanAccount.currency as CoinType,
                    userId,
                    accountId: cleanAccount.id,
                    xpub: cleanAccount.xpub,
                    mnemonic: encrypted,
                    active: cleanAccount.active,
                    frozen: cleanAccount.frozen
                })
                const data = await this.data.virtualAccounts.create(virtualAccountFactory)
                this.emitter.emit("send.webhook.subscription", {
                    accountId: data.accountId
                })
                return {
                    message: 'Wallet created successfully',
                    status: HttpStatus.CREATED,
                    data: {},
                    state: ResponseState.SUCCESS
                }
            }

            if (coin === 'BTC') {

                const { account: cleanAccount, encrypted } = await this.lib.generateBtcWallet({ username, userId, pin: user.transactionPin })
                const virtualAccountFactory = this.virtualAccountFactory.create({
                    coin: cleanAccount.currency as CoinType,
                    userId,
                    accountId: cleanAccount.id,
                    xpub: cleanAccount.xpub,
                    mnemonic: encrypted,
                    active: cleanAccount.active,
                    frozen: cleanAccount.frozen
                })
                const data = await this.data.virtualAccounts.create(virtualAccountFactory)
                this.emitter.emit("send.webhook.subscription", {
                    accountId: data.accountId
                })
                return {
                    message: 'Wallet created successfully',
                    status: HttpStatus.CREATED,
                    data: {},
                    state: ResponseState.SUCCESS
                }
            }


            if (coin === 'BSC') {

                const { account: cleanAccount, encrypted } = await this.lib.generateBscWallet({ username, userId, pin: user.transactionPin })
                const virtualAccountFactory = this.virtualAccountFactory.create({
                    coin: cleanAccount.currency as CoinType,
                    userId,
                    accountId: cleanAccount.id,
                    xpub: cleanAccount.xpub,
                    mnemonic: encrypted,
                    active: cleanAccount.active,
                    frozen: cleanAccount.frozen
                })
                const data = await this.data.virtualAccounts.create(virtualAccountFactory)
                this.emitter.emit("send.webhook.subscription", {
                    accountId: data.accountId
                })
                return {
                    message: 'Wallet created successfully',
                    status: HttpStatus.CREATED,
                    data: {},
                    state: ResponseState.SUCCESS
                }
            }

            return {
                message: 'Wallet created successfully',
                status: HttpStatus.CREATED,
                data: {},
                state: ResponseState.SUCCESS
            }


        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'GENERATING NON CUSTODIAL WALLET',
                error,
                message: error.message
            }

            this.utilsService.errorReporter(errorPayload)
            return Promise.reject({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                state: ResponseState.ERROR,
                email,
                message: error.message,
                error: error
            })
        }
    }

}
