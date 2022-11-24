import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import jwtLib from 'src/lib/jwtLib';
import { IDataServices } from "src/core/abstracts";
import { Gondor } from 'src/core/entities/Gondor';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OptionalQuery } from 'src/core/types/database';

export enum State {
  SUCCESS = "success",
  ERROR = "error"
}
export enum ActionType {
  PUT = "put",
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PATCH = "patch"
}

const returnState = (code: number) => {
  if (code >= 500) return State.ERROR;
  if (code >= 400) return State.ERROR;
  if (code >= 200) return State.SUCCESS;
};

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  constructor(
    private readonly data: IDataServices,
    private readonly emitter: EventEmitter2,

  ) { }

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', async () => {
      try {
        const { method, originalUrl, headers } = request
        const { statusCode, statusMessage } = response;
        const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;
        let token = request.headers.authorization;

        token = token ? token.replace('Bearer ', '') : null;
        const decoded = token ? await jwtLib.jwtVerify(token) : null;
        const user = decoded ? await this.data.users.findOne({ _id: decoded._id }) : null
        const checkUser = user ? true : false


        const sourceIp = Array.isArray(headers['x-original-forwarded-for']) ? headers['x-original-forwarded-for'].join(',') : headers['x-original-forwarded-for'];

        const sourceIpCountryCode = Array.isArray(headers['cf-ipcountry']) ? headers['cf-ipcountry'].join(',') : headers['cf-ipcountry'];
        const platform = Array.isArray(headers['platform']) ? headers['platform'].join(',') : headers['platform'];

        const operation = Array.isArray(headers['operation']) ? headers['operation'].join(',') : headers['operation'];
        const gondor: OptionalQuery<Gondor> = {
          state: returnState(statusCode),
          action: message,
          sourceIp,
          actionType: method as ActionType,
          userId: user ? String(user._id) : null,
          headers: headers,
          isAnonymous: !checkUser,
          originalUrl,
          statusCode: String(statusCode),
          sourceIpCountryCode,
          platform: platform || 'not-set',
          logMessage: '',
          operation: operation || 'not-set',
          operationId: '',
          userEmail: user ? user.email : null,
          app: 'switcha'
        };

        if (originalUrl === '/health') {
          Logger.log('Connection alive');
        } else {
          this.emitter.emit("save.to.gondor", gondor)
        }

        if (statusCode >= 500) return this.logger.error(message);
        if (statusCode >= 400) return this.logger.error(message);
        return this.logger.log(message);

      } catch (error) {
        Logger.error(`[logs-middleware]`, error)
      }

    });

    next();
  }
}

export default LogsMiddleware;