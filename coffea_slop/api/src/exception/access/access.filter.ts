import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessException } from './access.exception';

@Catch(AccessException)
export class AccessFilter
  implements ExceptionFilter {

  catch(exception: AccessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      error: 'Forbidden',
      message: exception.message,
      details: {
        entity: exception.entity,
        method: exception.method,
      },
    });
  }

}
