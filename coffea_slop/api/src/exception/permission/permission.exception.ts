import { HttpException, HttpStatus } from '@nestjs/common';
import { PermissionMethod } from '../../common/permission/permission.method';

export class PermissionException
  extends HttpException {

  readonly entity: string;
  readonly method: PermissionMethod;
  readonly resourceId?: string;

  constructor(entity: string, method: PermissionMethod, resourceId?: string) {
    const message = resourceId
      ? `Permission denied: ${method} on ${entity} with id ${resourceId}`
      : `Permission denied: ${method} on ${entity}`;

    super(message, HttpStatus.FORBIDDEN);

    this.entity = entity;
    this.method = method;
    this.resourceId = resourceId;
  }

}
