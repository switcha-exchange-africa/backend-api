
// import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { isEmpty } from "src/lib/utils";
// import { UnAuthorizedException } from "src/services/use-cases/user/exceptions";
// import { RoleDecoratorParams } from "src/core/types/roles";
// import { IDataServices } from "src/core/abstracts";

// @Injectable()
// export class CanUseFeatureGuard implements CanActivate {

//   constructor(
//     private readonly reflector: Reflector,
//     private readonly data: IDataServices,

//   ) { }

//   public async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       const decorator = this.reflector.get<RoleDecoratorParams>('can-use-feature', context.getHandler());
//       if (isEmpty(decorator)) return true

//       const request = context.switchToHttp().getRequest();
//       const user = request.user; //Use passport authentication strategy

//       const featureManagement = await this.data.userFeatureManagement.findOne({userId:user._id, })
//       return true;
//     } catch (error) {
//       Logger.error(error)
//       throw new UnAuthorizedException('Not permitted to perform this action')
//     }
//   }
// }
