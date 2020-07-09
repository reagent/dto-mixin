import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { DuplicateEmailsError } from '../users/user.service';
import { FilterHandler } from './filter-handler';

@Catch(DuplicateEmailsError)
export class DuplicateEmailFilter implements ExceptionFilter {
  catch(exception: DuplicateEmailsError, host: ArgumentsHost): Response<any> {
    return new FilterHandler(exception, host).respond(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
