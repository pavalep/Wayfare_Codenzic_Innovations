import {isValidEmail, validateLogin, MIN_PASSWORD_LENGTH} from '../../src/utils/validation';

const MESSAGES = {
  emailRequired: 'Enter your email address',
  emailInvalid: 'Enter a valid email address',
  passwordRequired: 'Enter your password',
  passwordShort: 'Password must be at least 6 characters',
};

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('you@example.com')).toBe(true);
    expect(isValidEmail('paval.ep@example.co.uk')).toBe(true);
  });

  it('trims surrounding whitespace before checking', () => {
    expect(isValidEmail('  you@example.com  ')).toBe(true);
  });

  it('rejects the obvious failures', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail('you@example')).toBe(false);
    expect(isValidEmail('you example.com')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('you@.com')).toBe(false);
  });
});

describe('validateLogin', () => {
  it('passes a well-formed form', () => {
    expect(validateLogin('you@example.com', 'secret123', MESSAGES)).toEqual([]);
  });

  it('reports a missing email first', () => {
    const errors = validateLogin('', 'secret123', MESSAGES);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({field: 'email', message: MESSAGES.emailRequired});
  });

  it('reports a malformed email', () => {
    const errors = validateLogin('nope', 'secret123', MESSAGES);
    expect(errors[0]).toEqual({field: 'email', message: MESSAGES.emailInvalid});
  });

  it('reports a missing password', () => {
    const errors = validateLogin('you@example.com', '', MESSAGES);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      field: 'password',
      message: MESSAGES.passwordRequired,
    });
  });

  it('reports a short password', () => {
    const errors = validateLogin('you@example.com', 'abc', MESSAGES);
    expect(errors[0]).toEqual({
      field: 'password',
      message: MESSAGES.passwordShort,
    });
  });

  it('reports both fields when both are wrong', () => {
    const errors = validateLogin('', 'a', MESSAGES);
    expect(errors.map(e => e.field)).toEqual(['email', 'password']);
  });

  it('accepts a password exactly at the minimum length', () => {
    const password = 'a'.repeat(MIN_PASSWORD_LENGTH);
    expect(validateLogin('you@example.com', password, MESSAGES)).toEqual([]);
  });
});
