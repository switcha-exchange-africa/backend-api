import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}