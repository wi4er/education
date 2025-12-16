import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WrongDataException } from './wrong-data.exception';

@Catch(WrongDataException)
export class WrongDataFilter implements ExceptionFilter {

  catch(exception: WrongDataException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: exception.message,
      details: {
        field: exception.field,
        value: exception.value,
        reason: exception.reason,
      },
    });
  }

}
