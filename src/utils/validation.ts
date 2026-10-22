// ─── Form validation ───────────────────────────────────────────
//
// Pure functions, no React. Keeping them out of the component means
// they can be unit-tested directly and reused by any form.
//
// The rules are deliberately simple and explicit — an interviewer
// should be able to read them in one pass.

/** The shape of a validation result. */
export interface FieldError {
  field: 'email' | 'password';
  message: string;
}

/**
 * A pragmatic email check.
 *
 * It is not an RFC 5322 validator — it rejects the obviously wrong
 * shapes (missing `@`, missing domain, spaces) without trying to
 * implement the full spec.
 */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/** Minimum accepted password length. */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Validates the login form.
 *
 * Returns one entry per invalid field, in the order the fields
 * appear on screen. An empty array means the form is good.
 */
export function validateLogin(
  email: string,
  password: string,
  messages: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
  },
): FieldError[] {
  const errors: FieldError[] = [];

  if (!email.trim()) {
    errors.push({field: 'email', message: messages.emailRequired});
  } else if (!isValidEmail(email)) {
    errors.push({field: 'email', message: messages.emailInvalid});
  }

  if (!password) {
    errors.push({field: 'password', message: messages.passwordRequired});
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({field: 'password', message: messages.passwordShort});
  }

  return errors;
}

// ─── Registration ─────────────────────────────────────────────

/** The fields a registration form has. */
export type RegisterField = 'name' | 'email' | 'password' | 'confirm';

/** The shape of a registration validation result. */
export interface RegisterFieldError {
  field: RegisterField;
  message: string;
}

/**
 * Validates the registration form.
 *
 * The email and password rules are the SAME rules the login form
 * uses — a password that is acceptable at sign-in has to be
 * acceptable at sign-up, or the account would be created and then
 * rejected. The two extra rules are the name and the confirmation.
 *
 * Errors come back in the order the fields appear on screen.
 */
export function validateRegister(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  messages: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
    confirmRequired: string;
    confirmMismatch: string;
  },
): RegisterFieldError[] {
  const errors: RegisterFieldError[] = [];

  if (!name.trim()) {
    errors.push({field: 'name', message: messages.nameRequired});
  }

  if (!email.trim()) {
    errors.push({field: 'email', message: messages.emailRequired});
  } else if (!isValidEmail(email)) {
    errors.push({field: 'email', message: messages.emailInvalid});
  }

  if (!password) {
    errors.push({field: 'password', message: messages.passwordRequired});
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({field: 'password', message: messages.passwordShort});
  }

  // The confirmation is only checked once there IS something to
  // confirm. Telling someone their confirmation does not match
  // before they have typed a password would be noise.
  if (!confirmPassword) {
    errors.push({field: 'confirm', message: messages.confirmRequired});
  } else if (password && confirmPassword !== password) {
    errors.push({field: 'confirm', message: messages.confirmMismatch});
  }

  return errors;
}
