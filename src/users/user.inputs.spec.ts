import { validateSync } from 'class-validator';
import { UserCreate } from './user.inputs';

import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils';

interface Result {
  pass: boolean;
  message: () => string;
}

const objectsEqual = (
  expected: Record<string, string>,
  actual: Record<string, string>,
): boolean => {
  const allKeys = Object.keys(actual).concat(Object.keys(expected));
  const uniqueKeys = Array.from(new Set(allKeys));

  return (
    uniqueKeys.length > 0 &&
    uniqueKeys.every(key => actual[key] === expected[key])
  );
};

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

function toBeValid(instance: any): Result {
  const validationErrors = validateSync(instance);

  if (validationErrors.length > 0) {
    const propertyNames = validationErrors.map(e => e.property);

    return {
      pass: false,
      message: () =>
        `Expected object to be valid, but had errors on '${propertyNames.join(
          "', '",
        )}'.`,
    };
  } else {
    return {
      pass: true,
      message: () =>
        this.isNot
          ? 'Expected object to be invalid, but was valid.'
          : 'Object was valid.',
    };
  }
}

function toHaveErrorsOn(
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

  if (matchingError && !errors) {
    return { pass: true, message: () => `Found errors on '${property}'` };
  }

  if (
    matchingError &&
    errors &&
    objectsEqual(errors, matchingError.constraints)
  ) {
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

const jestExpect = (global as any).expect;

jestExpect.extend({ toHaveErrorsOn, toBeValid });

describe('User Inputs', () => {
  let subject: UserCreate;

  beforeEach(() => {
    subject = new UserCreate();
  });

  describe('name', () => {
    it('has errors when there is no value provided', () => {
      expect(subject).toHaveErrorsOn('name', {
        isNotEmpty: 'name should not be empty',
      });
    });

    it('does not have errors when a value is provided', () => {
      subject.name = 'A';
      expect(subject).not.toHaveErrorsOn('name');
    });
  });

  describe('emails', () => {
    it('does not require emails', () => {
      subject.emails = [];
      expect(subject).not.toHaveErrorsOn('emails');
    });

    it('has errors when all emails do not look like an email', () => {
      subject.emails = ['bogus'];

      expect(subject).toHaveErrorsOn('emails', {
        isEmail: 'each value in emails must be an email',
      });
    });

    it('has errors when even one email does not look like an email', () => {
      subject.emails = ['user@host.example', 'bogus'];

      expect(subject).toHaveErrorsOn('emails');
    });
  });
});
