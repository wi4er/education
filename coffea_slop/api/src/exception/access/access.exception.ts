import { HttpException, HttpStatus } from '@nestjs/common';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';

export class AccessException
  extends HttpException {

  readonly entity: AccessEntity;
  readonly method: AccessMethod;

  constructor(entity: AccessEntity, method: AccessMethod) {
    const message = `Access denied: ${method} on ${entity}`;

    super(message, HttpStatus.FORBIDDEN);

    this.entity = entity;
    this.method = method;

  }
}
