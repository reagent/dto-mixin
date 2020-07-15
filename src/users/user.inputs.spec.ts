import { Create, Update } from './user.inputs';
import { util } from 'prettier';

describe('Create', () => {
  let subject: Create;

  beforeEach(() => {
    subject = new Create();
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

describe('Update', () => {
  let subject: Update;

  beforeEach(() => {
    subject = new Update();
  });

  describe('name', () => {
    it('is not required', () => {
      expect(subject).not.toHaveErrorsOn('name');
    });

    it('must not be empty', () => {
      subject.name = '';
      expect(subject).toHaveErrorsOn('name');
    });
  });

  describe('emails', () => {
    it('is not required', () => {
      expect(subject).not.toHaveErrorsOn('emails');
    });

    it('requires the values to be emails', () => {
      subject.emails = ['bogus'];
      expect(subject).toHaveErrorsOn('emails', {
        isEmail: 'each value in emails must be an email',
      });
    });
  });
});
