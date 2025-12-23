import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongDataException extends HttpException {
  readonly field?: string;
  readonly value?: any;
  readonly reason?: string;

  constructor(message: string, field?: string, value?: any, reason?: string) {
    super(message, HttpStatus.BAD_REQUEST);

    this.field = field;
    this.value = value;
    this.reason = reason;
  }
}
