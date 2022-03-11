import { IDataServices } from 'src/core/abstracts';
import { MongoDataServices } from './../../../frameworks/data-services/mongo/mongo-data-services.service';
import { HttpException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class WalletServices{
    
    constructor(
        private dataServices: IDataServices
    ){}

    async findAllUserWallets(userId: string ){
        return userId;
    }

    async findWalletDetails(walletId: string){
        return walletId
    }
}