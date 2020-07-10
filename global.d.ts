declare namespace jest {
  interface Matchers<R> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toHaveErrorsOn(property: string, errors?: Record<string, string>): R;
    toBeValid(): R;
  }
}
