import { Injectable } from "@nestjs/common";
import { TradeDispute } from "src/core/entities/Trade-Disputes";
import { OptionalQuery } from "src/core/types/database";
import { Status } from "src/core/types/status";
import { randomFixedInteger } from "src/lib/utils";

@Injectable()
export class TradeDisputeFactoryService {
  create(data: OptionalQuery<TradeDispute>) {
    const dispute = new TradeDispute();
    if (data.userId) dispute.userId = data.userId;
    if (data.tradeId) dispute.tradeId = data.tradeId;
    dispute.disputeId = String(randomFixedInteger(15));
    dispute.status = Status.PENDING
    if (data.messages) dispute.messages = data.messages;
    if (data.resolvedBy) dispute.resolvedBy = data.resolvedBy;
    if (data.resolveAdminBy) dispute.resolveAdminBy = data.resolveAdminBy;
    if (data.buyer) dispute.buyer = data.buyer;
    if (data.seller) dispute.seller = data.seller;

    return dispute;
  }
}