// import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import { isEmpty } from "src/lib/utils";

// @Injectable()
// export class BypassGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//   ) { }

//   async canActivate(context: ExecutionContext): Promise<boolean> {

//     try {
//       const request: any = context.switchToHttp().getRequest();

//       const decorator = this.reflector.get<string>('fee-wallet-set', context.getHandler());
//       if (isEmpty(decorator)) return true

//       const

//       return true;
//     } catch (error) {
//       Logger.error('@jwt-bypass-error', error)
//       throw new UnAuthorizedException("Unauthorized")
//     }
//   }
// }