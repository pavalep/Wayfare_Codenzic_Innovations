import {validateRegister} from '../../src/utils/validation';

const MESSAGES = {
  nameRequired: 'Enter your name',
  emailRequired: 'Enter your email address',
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Enter your password',
  passwordShort: 'Password must be at least 6 characters',
  confirmRequired: 'Confirm your password',
  confirmMismatch: 'Passwords do not match',
};

describe('validateRegister', () => {
  it('passes a well-formed form', () => {
    expect(
      validateRegister('Paval E P', 'you@example.com', 'secret123', 'secret123', MESSAGES),
    ).toEqual([]);
  });

  it('reports a missing name', () => {
    const errors = validateRegister(
      '',
      'you@example.com',
      'secret123',
      'secret123',
      MESSAGES,
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({field: 'name', message: MESSAGES.nameRequired});
  });

  it('treats a whitespace-only name as missing', () => {
    const errors = validateRegister(
      '   ',
      'you@example.com',
      'secret123',
      'secret123',
      MESSAGES,
    );
    expect(errors[0]).toEqual({field: 'name', message: MESSAGES.nameRequired});
  });

  it('applies the same email rules as the login form', () => {
    const errors = validateRegister(
      'Paval E P',
      'nope',
      'secret123',
      'secret123',
      MESSAGES,
    );
    expect(errors[0]).toEqual({field: 'email', message: MESSAGES.emailInvalid});
  });

  it('applies the same password rules as the login form', () => {
    const errors = validateRegister(
      'Paval E P',
      'you@example.com',
      'abc',
      'abc',
      MESSAGES,
    );
    expect(errors[0]).toEqual({
      field: 'password',
      message: MESSAGES.passwordShort,
    });
  });

  it('reports a missing confirmation', () => {
    const errors = validateRegister(
      'Paval E P',
      'you@example.com',
      'secret123',
      '',
      MESSAGES,
    );
    expect(errors[0]).toEqual({
      field: 'confirm',
      message: MESSAGES.confirmRequired,
    });
  });

  it('reports a confirmation that does not match', () => {
    const errors = validateRegister(
      'Paval E P',
      'you@example.com',
      'secret123',
      'secret124',
      MESSAGES,
    );
    expect(errors[0]).toEqual({
      field: 'confirm',
      message: MESSAGES.confirmMismatch,
    });
  });

  it('does not complain about the confirmation before a password exists', () => {
    // A mismatch is only meaningful once there is something to
    // mismatch — flagging it before the user has typed a password
    // would be noise.
    const errors = validateRegister(
      'Paval E P',
      'you@example.com',
      '',
      'secret123',
      MESSAGES,
    );
    expect(errors.map(e => e.field)).toEqual(['password']);
  });

  it('reports every broken field, in screen order', () => {
    const errors = validateRegister('', '', '', '', MESSAGES);
    expect(errors.map(e => e.field)).toEqual([
      'name',
      'email',
      'password',
      'confirm',
    ]);
  });
});
