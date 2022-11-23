import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ADMIN_CYPHER_SECRET } from "src/configuration";
import { IDataServices } from "src/core/abstracts";
import jwtLib from "src/lib/jwtLib";
import { isEmpty } from "src/lib/utils";
import { DoesNotExistsException, UnAuthorizedException } from "src/services/use-cases/user/exceptions";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly data: IDataServices,
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();
      const decorator = this.reflector.get<string>('is-authenticated', context.getHandler());
      if (isEmpty(decorator)) return true

      let token = request.headers.authorization;
      if (!token) throw new UnAuthorizedException("Unauthorized")
      token = token.replace('Bearer ', '');

      const decoded = await jwtLib.jwtVerify(token);
      if (!decoded) throw new UnAuthorizedException("Unauthorized")
      console.log("decoded")
      console.log(decoded)
      const user = await this.data.users.findOne({ _id: decoded._id })
      if (!user) throw new DoesNotExistsException('User does not exists')
      request.user = decoded;
      console.log(user)
      console.log("EMAIL VERIFIED", user.emailVerified)
      if (decorator !== 'strict') return true
      if (!user.emailVerified) throw new UnAuthorizedException('Unauthorized. please verify email')

      return true;

    } catch (error) {
      Logger.error(error)
      throw new UnAuthorizedException(error)
    }
  }
}


@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly data: IDataServices,
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();
      const decorator = this.reflector.get<string>('is-admin-authenticated', context.getHandler());
      if (isEmpty(decorator)) return true

      let token = request.headers.authorization;
      if (!token) throw new UnAuthorizedException("Unauthorized")
      token = token.replace('Bearer ', '');

      const decoded = await jwtLib.jwtVerify(token);
      if (!decoded) throw new UnAuthorizedException("Unauthorized")

      const user = await this.data.admins.findOne({ _id: decoded._id })
      if (!user) throw new DoesNotExistsException('User does not exists')
      request.user = decoded;

      // if (decorator !== 'strict') return true
      // if (!user.emailVerified) throw new UnAuthorizedException('Unauthorized. please verify email')

      return true;

    } catch (error) {
      Logger.error(error)
      throw new UnAuthorizedException(error)
    }
  }
}



@Injectable()
export class BypassGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();
      const decorator = this.reflector.get<string>('by-pass', context.getHandler());
      if (isEmpty(decorator)) return true

      const token = request.headers.bypass;
      if (token !== ADMIN_CYPHER_SECRET) throw new UnAuthorizedException("unauthorized")

      return true;
    } catch (error) {
      Logger.error('@jwt-bypass-error', error)
      throw new UnAuthorizedException("unauthorized")
    }
  }
}

@Injectable()
export class IsLevelTwoGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();
      const decorator = this.reflector.get<string>('level-two', context.getHandler());
      if (isEmpty(decorator)) return true

      if (request.user.level === 'three') return true
      if (request.user.level !== 'two') throw new UnAuthorizedException("Please upgrade your kyc to level 2")

      return true;
    } catch (error) {
      Logger.error('@jwt-bypass-error', error)
      throw new UnAuthorizedException(error.message)
    }
  }
}
@Injectable()
export class IsLevelThreeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector

  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const request: any = context.switchToHttp().getRequest();
      const decorator = this.reflector.get<string>('level-three', context.getHandler());
      if (isEmpty(decorator)) return true

      if (request.user.level !== 'three') throw new UnAuthorizedException("Please upgrade your kyc to level 3")

      return true;
    } catch (error) {
      Logger.error('@jwt-bypass-error', error)
      throw new UnAuthorizedException(error.message)
    }
  }
}
// @Injectable()
// export class UserFeatureManagementGuard implements CanActivate {
//   constructor(
//     private readonly data: IDataServices,
//     private readonly reflector: Reflector
//   ) { }

//   async canActivate(context: ExecutionContext): Promise<boolean> {

//     try {
//       const request: any = context.switchToHttp().getRequest();
//       const decorator = this.reflector.get<string>('user-feature-management', context.getHandler());
//       if (isEmpty(decorator)) return true

//       const userId = request.user._id
//       const userFeature = await this.data.userFeatureManagement.findOne({ userId })
//       if (!userFeature) throw new BadRequestsException('No able to use this feature, please contact support@switcha.africa')

//       if (decorator !== 'strict') return true
//       if (!user.emailVerified) throw new UnAuthorizedException('Unauthorized. please verify email')

//       return true;

//     } catch (error) {
//       Logger.error(error)
//       throw new UnAuthorizedException(error)
//     }
//   }
// }