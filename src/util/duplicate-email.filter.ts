import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { DuplicateEmailsError } from '../users/user.service';
import { FilterHandler } from './filter-handler';

@Catch(DuplicateEmailsError)
export class DuplicateEmailFilter implements ExceptionFilter {
  catch(exception: DuplicateEmailsError, host: ArgumentsHost) {
    return new FilterHandler(exception, host).respond(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
