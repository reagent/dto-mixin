import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FilterHandler } from './filter-handler';

@Catch(EntityNotFoundError)
export class ResourceNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    return new FilterHandler(exception, host).respond(HttpStatus.NOT_FOUND);
  }
}
