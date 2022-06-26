import { Injectable } from '@nestjs/common';
import { env } from 'src/configuration';

@Injectable()
export class HomeServices {
  constructor() { }


  health(): string {
    return `${env.env} OK `;
  }

}

