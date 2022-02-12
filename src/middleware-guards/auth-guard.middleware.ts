import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { USER_SIGNUP_STATUS_TYPE, VERIFICATION_VALUE_TYPE } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import { DoesNotExistsException, UnAuthorizedException } from "src/services/use-cases/user/exceptions";




@Injectable()
export class StrictAuthGuard implements CanActivate {
  constructor(private readonly dataServices: IDataServices
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();

      let token = request.headers.authorization;
      if (!token) throw new UnAuthorizedException("Unauthorized")
      token = token.replace('Bearer ', '');

      const decoded = await jwtLib.jwtVerify(token);
      if (!decoded) throw new UnAuthorizedException("Unauthorized")
      if (decoded.authStatus !== USER_SIGNUP_STATUS_TYPE.COMPLETED) throw new UnAuthorizedException('Unauthorized. Please verify account')
      if (decoded.verified === VERIFICATION_VALUE_TYPE.FALSE) throw new UnAuthorizedException('Unauthorized. Please verify account')
      request.user = decoded;

      return true;
    } catch (error) {
      Logger.error('@jwt-middleware-error', error)
      throw new UnAuthorizedException("Unauthorized")
    }
  }
}


@Injectable()
export class LooseAuthGuard implements CanActivate {
  constructor(private readonly dataServices: IDataServices
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();

      let token = request.headers.authorization;
      if (!token) throw new UnAuthorizedException("Unauthorized")
      token = token.replace('Bearer ', '');

      const decoded = await jwtLib.jwtVerify(token);
      if (!decoded) throw new UnAuthorizedException("Unauthorized")

      const user = await this.dataServices.users.findOne({ email: decoded.email });
      if (!user) {
        throw new DoesNotExistsException('user does not exists')
      }
      request.user = decoded;

      return true;
    } catch (error) {
      Logger.error('@jwt-middleware-error', error)
      throw new UnAuthorizedException("Unauthorized")
    }
  }
}

