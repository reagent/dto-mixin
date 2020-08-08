import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class FilterHandler {
  constructor(private exception: Error, private host: ArgumentsHost) {}

  respond(status: HttpStatus): Response<any> {
    return this.response()
      .status(status)
      .json({ statusCode: status, message: this.exception.message });
  }

  protected response(): Response {
    return this.host.switchToHttp().getResponse<Response>();
  }
}
