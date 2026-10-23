import {useCallback, useState} from 'react';

import {STRINGS} from '../constants';
import type {SignInResult} from '../state';
import {validateLogin, type FieldError} from '../utils/validation';

/** Errors keyed by field name. */
export type LoginErrors = Partial<Record<FieldError['field'], string>>;

/**
 * The login form's state and validation.
 *
 * The form is uncontrolled-by-React-Native-Form-Library on purpose:
 * there is no form library in this app, so the state lives in a hook
 * and the validation lives in a pure function (`utils/validation`)
 * that can be unit-tested on its own.
 *
 * Validation runs on submit. It does NOT run on every keystroke —
 * showing "this email is invalid" while someone is halfway through
 * typing it is hostile. Once a field has been flagged, editing it
 * clears its error immediately so the message never goes stale.
 *
 * THE CREDENTIAL CHECK LIVES IN THE STORE
 *
 * This hook does not know what an account is. It validates the SHAPE
 * of what was typed — is this an email, is the password long enough —
 * and then hands the pair to the caller, which runs the real check
 * against the accounts registered on this device.
 *
 * The refusal comes back as a `SignInResult` and is turned into a
 * field error here, so the message lands on the field that caused it:
 * an unknown email is flagged on the email field, a wrong password on
 * the password field.
 */
export function useLoginForm(onSignIn: (email: string, password: string) => SignInResult) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setErrors(current =>
      current.email ? {...current, email: undefined} : current,
    );
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setErrors(current =>
      current.password ? {...current, password: undefined} : current,
    );
  }, []);

  /**
   * Validates, then asks the caller to check the credentials.
   *
   * Returns whether the submission was accepted so the caller can
   * react (e.g. keep focus on the first bad field).
   */
  const submit = useCallback((): boolean => {
    const found = validateLogin(email, password, STRINGS.login.errors);

    if (found.length > 0) {
      setErrors({
        email: found.find(e => e.field === 'email')?.message,
        password: found.find(e => e.field === 'password')?.message,
      });
      return false;
    }

    const result = onSignIn(email.trim().toLowerCase(), password);

    if (result === 'unknown-email') {
      setErrors({email: STRINGS.login.errors.unknownAccount});
      return false;
    }

    if (result === 'wrong-password') {
      setErrors({password: STRINGS.login.errors.wrongPassword});
      return false;
    }

    setErrors({});
    return true;
  }, [email, onSignIn, password]);

  return {
    email,
    password,
    errors,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    submit,
  };
}
