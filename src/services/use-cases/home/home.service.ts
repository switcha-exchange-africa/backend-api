import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeServices {
  

  health(): string {
    return 'OK OH UPDATE';
  }

}

