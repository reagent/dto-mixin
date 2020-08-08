import { validateSync } from 'class-validator';
import { Result } from './types';

export function toBeValid(instance: any): Result {
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
