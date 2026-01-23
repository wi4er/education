import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import {Response} from 'express';
import {QueryFailedError} from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter
  implements ExceptionFilter {

  catch(
    exception: QueryFailedError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: 'Database query failed',
      details: {
        code: (exception as any).code,
        constraint: (exception as any).constraint,
      },
    });
  }

}
