import { toHaveErrorsOn } from './matchers/have-errors-on.matcher';
import { toBeValid } from './matchers/be-valid.matcher';
import { toSerializeAs } from './matchers/serialize-as.matcher';

const jestExpect = (global as any).expect;

if (jestExpect !== undefined) {
  jestExpect.extend({ toHaveErrorsOn, toBeValid, toSerializeAs });
} else {
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-matchers correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
}
