import { ClassSerializerInterceptor, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ExcludingSerializer extends ClassSerializerInterceptor {
  constructor() {
    // Not sure how `Reflector` is used, but this is provided to the serializer
    // to conform to the required interface
    super(new Reflector(), { strategy: 'excludeAll' });
  }
}
