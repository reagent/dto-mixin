import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';
import { DuplicateEmailsError } from '../users/user.service';

@Catch(DuplicateEmailsError)
export class DuplicateEmailFilter implements ExceptionFilter {
  catch(exception: DuplicateEmailsError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
