import {useCallback, useState} from 'react';

import {STRINGS} from '../constants';
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
 */
export function useLoginForm(onSuccess: (email: string) => void) {
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
   * Validates and, if the form is good, hands the email to
   * `onSuccess`. Returns whether the submission was accepted so the
   * caller can react (e.g. keep focus on the first bad field).
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

    setErrors({});
    onSuccess(email.trim().toLowerCase());
    return true;
  }, [email, password, onSuccess]);

  return {
    email,
    password,
    errors,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    submit,
  };
}
