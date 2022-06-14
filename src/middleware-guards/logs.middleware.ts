import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  constructor() { }

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', async () => {
      const { method, originalUrl } = request
      const { statusCode, statusMessage } = response;
      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;

      return this.logger.log(message);

    });

    next();
  }
}

export default LogsMiddleware;