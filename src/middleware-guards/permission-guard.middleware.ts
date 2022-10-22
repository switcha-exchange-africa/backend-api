import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { isEmpty } from "src/lib/utils";
import { UnAuthorizedException } from "src/services/use-cases/user/exceptions";
import ac from "src/lib/roles";
import { RoleDecoratorParams } from "src/core/types/roles";

@Injectable()
export class PermissionGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const decorator = this.reflector.get<RoleDecoratorParams>('permission', context.getHandler());
      if (isEmpty(decorator)) return true

      const request = context.switchToHttp().getRequest();
      const user = request.user; //Use passport authentication strategy

      const permission = ac.can(user.roles)[decorator.action](decorator.resource);
      if (!permission.granted) throw new UnAuthorizedException('Not permitted to perform this action')

      return true;
    } catch (error) {
      Logger.error(error)
      throw new UnAuthorizedException('Not permitted to perform this action')
    }
  }
}
