import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeServices {
  constructor() { }


  health(): string {
    return 'OK';
  }

}

