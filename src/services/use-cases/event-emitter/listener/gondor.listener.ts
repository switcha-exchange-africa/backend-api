import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { OptionalQuery } from "src/core/types/database";
import { Gondor, GondorDocument } from "src/frameworks/data-services/mongo/model/Gondor";
import { GondorEvent } from "../event/gondor.event";

class GondorFactoryServices {
    create(data: OptionalQuery<GondorEvent>) {
        const gondor = new GondorEvent();
        if (data.userId) gondor.userId = data.userId;
        if (data.action) gondor.action = data.action;
        if (data.sourceIp) gondor.sourceIp = data.sourceIp;
        if (data.sourceIpCountryCode) gondor.sourceIpCountryCode = data.sourceIpCountryCode;
        if (data.state) gondor.state = data.state;
        if (data.statusCode) gondor.statusCode = data.statusCode;
        if (data.actionType) gondor.actionType = data.actionType;
        if (data.platform) gondor.platform = data.platform;
        if (data.headers) gondor.headers = data.headers;
        if (data.originalUrl) gondor.originalUrl = data.originalUrl;
        if (data.logMessage) gondor.logMessage = data.logMessage;
        if (data.operation) gondor.operation = data.operation;
        if (data.operationId) gondor.operationId = data.operationId;
        if (data.userEmail) gondor.userEmail = data.userEmail;
        if (data.app) gondor.app = data.app;
        if (data.isAnonymous) gondor.isAnonymous = data.isAnonymous;
        return gondor;
    }
}


@Injectable()
export class GondorListener {
    constructor(
        @InjectModel(Gondor.name) private readonly gondorModel: Model<GondorDocument>,
    ) { }


    @OnEvent('save.to.gondor', { async: true })
    async saveToGondor(event: FilterQuery<Gondor>) {
        try {
            const factory = new GondorFactoryServices().create(event)
            console.log("FACTORY", factory)
            await this.gondorModel.create(factory)
            Logger.log('@[gondor]', 'Saved to gondor')
            return
        } catch (error) {
            Logger.error(error)
        }
    }


}