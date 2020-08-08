import { serialize } from 'class-transformer';
import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';
import { equals } from 'expect/build/jasmineUtils';

// This shim is required in test only to prevent this error:
//  FAIL  src/users/user.serializer.spec.ts
//  ● Test suite failed to run
//
//    TypeError: Reflect.getMetadata is not a function
//
//      at decorators.ts:27:39
//      at __decorate (users/user.serializers.ts:5:110)
//      at Object.<anonymous> (users/user.serializers.ts:32:3)
//      at Object.<anonymous> (users/user.serializer.spec.ts:3:1)
//
import 'reflect-metadata';

const failureMessage = (actual, expected) => () =>
  matcherHint('.toSerializeAs') +
  '\n\n' +
  `Expected:\n` +
  `  ${printExpected(expected)}\n` +
  'Received:\n' +
  `  ${printReceived(actual)}`;

export function toSerializeAs(instance: any, expected: any) {
  const stringified = serialize(instance, { strategy: 'excludeAll' });
  const serialized = JSON.parse(stringified);
  const valid = equals(serialized, expected);

  if (valid) {
    return { pass: true, message: () => 'Serialized object matches expected' };
  } else {
    return {
      pass: false,
      message: failureMessage(serialized, expected),
    };
  }
}
