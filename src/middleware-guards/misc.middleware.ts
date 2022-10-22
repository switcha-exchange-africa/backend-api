import { CanActivate, ExecutionContext, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { isEmpty } from "src/lib/utils";
import { Reflector } from "@nestjs/core";


@Injectable()
export class FeatureManagementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly data: IDataServices,

  ) { }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const decorator = this.reflector.get<string>('feature', context.getHandler());
      if (isEmpty(decorator)) return true;

      const feature = await this.data.featureManagement.findOne({ feature: decorator }) 
      if (!feature) return true

      if (!feature.active) throw new ServiceUnavailableException('This feature is under maintenance');

      return true;
    } catch (error) {
      Logger.error(error);
      throw new ServiceUnavailableException('This feature is under maintenance');
    }
  }
}