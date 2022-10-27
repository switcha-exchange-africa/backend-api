import { Injectable } from "@nestjs/common";
import { Kyc } from "src/core/entities/Kyc";
import { OptionalQuery } from "src/core/types/database";
import { Status } from "src/core/types/status";

@Injectable()
export class KycFactoryService {
  create(data: OptionalQuery<Kyc>) {
    const kyc = new Kyc();
    if (data.userId) kyc.userId = data.userId;
    if (data.image) kyc.image = data.image;
    if (data.selfie) kyc.selfie = data.selfie;
    if (data.userId) kyc.userId = data.userId;
    if (data.level) kyc.level = data.level;
    kyc.status = Status.PENDING
    return kyc;
  }
}
