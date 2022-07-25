import { SetMetadata } from "@nestjs/common";
import { RoleDecoratorParams } from "src/core/types/roles";

export const Permission = (params: RoleDecoratorParams) =>
  SetMetadata('permission', params);
