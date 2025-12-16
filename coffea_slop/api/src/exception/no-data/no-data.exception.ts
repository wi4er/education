import { HttpException, HttpStatus } from '@nestjs/common';

export class NoDataException extends HttpException {

  readonly entity: string;
  readonly id?: string;

  constructor(
    entity: string,
    id?: string,
  ) {
    const message = id
      ? `${entity} with id ${id} not found`
      : `${entity} not found`;

    super(message, HttpStatus.NOT_FOUND);

    this.entity = entity;
    this.id = id;
  }

}
