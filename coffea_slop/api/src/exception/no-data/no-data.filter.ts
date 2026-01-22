import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import {Response} from 'express';
import {NoDataException} from './no-data.exception';

@Catch(NoDataException)
export class NoDataFilter
  implements ExceptionFilter {

  catch(exception: NoDataException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message: exception.message,
      details: {
        entity: exception.entity,
        id: exception.id,
      },
    });
  }

}
