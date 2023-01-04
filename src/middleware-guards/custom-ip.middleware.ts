import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
var requestIp = require('request-ip');

@Injectable()
class CustomIpMiddleware implements NestMiddleware {
    constructor() { }

    use(_request: Request, _response: Response, next: NextFunction) {
        requestIp.mw({ attributeName: 'ip' })
        next();
    }
}



export default CustomIpMiddleware;