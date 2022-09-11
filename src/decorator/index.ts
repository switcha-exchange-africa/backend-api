import { SetMetadata } from "@nestjs/common";
import { RoleDecoratorParams } from "src/core/types/roles";

export const Permission = (params: RoleDecoratorParams) =>
  SetMetadata('permission', params);

export const Authorization = (strict: 'strict' | 'loose') => SetMetadata('authorization', strict);
