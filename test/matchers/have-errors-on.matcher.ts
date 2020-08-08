import { validateSync } from 'class-validator';
import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';
import { equals } from 'expect/build/jasmineUtils';

import { Result } from './types';

const failMessage = (
  property: string,
  actual: unknown,
  expected: unknown,
) => () =>
  matcherHint('.toHaveErrorsOn', undefined, `'${property}', expected`) +
  '\n\n' +
  `Expected errors on property '${property}':\n` +
  `  ${printExpected(expected)}\n` +
  'Received:\n' +
  `  ${printReceived(actual)}`;

export function toHaveErrorsOn(
  instance: any,
  property: string,
  errors?: Record<string, string>,
): Result {
  const validationErrors = validateSync(instance);

  const matchingError = validationErrors.find(
    error => error.property === property,
  );

  if (this.isNot) {
    if (matchingError) {
      return {
        pass: true,
        message: () =>
          `Expected no error on '${property}', got:\n ${printReceived(
            matchingError.constraints,
          )}`,
      };
    } else {
      return {
        pass: false,
        message: () => 'Found no errors.',
      };
    }
  }

  // toHaveErrorsOn('name')
  if (matchingError && !errors) {
    return { pass: true, message: () => `Found errors on '${property}'` };
  }

  if (matchingError && errors && equals(errors, matchingError.constraints)) {
    return {
      pass: true,
      message: () => 'Expected errors match actual errors.',
    };
  } else {
    return {
      pass: false,
      message: failMessage(property, matchingError?.constraints || {}, errors),
    };
  }
}
