import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import {Response} from 'express';
import {PermissionException} from './permission.exception';

@Catch(PermissionException)
export class PermissionFilter
  implements ExceptionFilter {

  catch(exception: PermissionException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      error: 'Forbidden',
      message: exception.message,
      details: {
        entity: exception.entity,
        method: exception.method,
        resourceId: exception.resourceId,
      },
    });
  }

}
