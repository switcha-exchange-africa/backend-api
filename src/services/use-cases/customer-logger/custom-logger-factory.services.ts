import { Injectable } from "@nestjs/common";
import { CustomLogger } from "src/core/entities/CustomLogger";

@Injectable()
export class CustomLoggerFactoryServices {
  create(data: CustomLogger) {
    const logger = new CustomLogger();
    if (data.userId) logger.userId = data.userId;
    if (data.endpoint) logger.endpoint = data.endpoint;
    if (data.method) logger.method = data.method;
    if (data.operation) logger.operation = data.operation;
    if (data.message) logger.message = data.message;
    if (data.type) logger.type = data.type;
    if (data.error) logger.error = data.error;
    if (data.operationType) logger.operationType = data.operationType;
    if (data.walletId) logger.walletId = data.walletId;
    if (data.statusCode) logger.statusCode = data.statusCode;
    logger.createdAt = new Date()
    logger.updatedAt = new Date()

    return logger;
  }
}
