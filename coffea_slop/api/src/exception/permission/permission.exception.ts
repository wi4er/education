import { HttpException, HttpStatus } from '@nestjs/common';
import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../../personal/entities/access/access-method.enum';

export class PermissionException extends HttpException {

  readonly entity: AccessEntity;
  readonly method: AccessMethod;
  readonly resourceId?: string;

  constructor(
    entity: AccessEntity,
    method: AccessMethod,
    resourceId?: string,
  ) {
    const message = resourceId
      ? `Permission denied: ${method} on ${entity} with id ${resourceId}`
      : `Permission denied: ${method} on ${entity}`;

    super(message, HttpStatus.FORBIDDEN);

    this.entity = entity;
    this.method = method;
    this.resourceId = resourceId;
  }

}
