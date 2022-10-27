import { USER_LEVEL_TYPE } from "src/lib/constants";
import { Status } from "../types/status";

export class Kyc {
  image: string;
  selfie: string;
  createdAt: Date
  updatedAt: Date
  userId: string;
  status: Status
  level: USER_LEVEL_TYPE
}

