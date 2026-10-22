import {useCallback, useState} from 'react';

import {STRINGS} from '../constants';
import {validateRegister, type RegisterFieldError} from '../utils/validation';

/** Errors keyed by field name. */
export type RegisterErrors = Partial<Record<RegisterFieldError['field'], string>>;

/**
 * The registration form's state and validation.
 *
 * The shape mirrors `useLoginForm` deliberately: validation runs on
 * submit rather than on every keystroke, and editing a field that
 * has been flagged clears its error immediately so the message never
 * goes stale.
 *
 * The difference is the field count. Registration asks for a name
 * and a password confirmation on top of the login form's two fields,
 * and each of them has its own rule — see `validateRegister`.
 */
export function useRegisterForm(onSuccess: (email: string) => void) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});

  const clearError = useCallback((field: RegisterFieldError['field']) => {
    setErrors(current =>
      current[field] ? {...current, [field]: undefined} : current,
    );
  }, []);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      clearError('name');
    },
    [clearError],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      clearError('email');
    },
    [clearError],
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      clearError('password');
      // Changing the password can invalidate the confirmation, so its
      // error is cleared too — otherwise the form would complain
      // about a mismatch the user can no longer see.
      clearError('confirm');
    },
    [clearError],
  );

  const handleConfirmChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      clearError('confirm');
    },
    [clearError],
  );

  /**
   * Validates and, if the form is good, hands the email to
   * `onSuccess`. Returns whether the submission was accepted.
   */
  const submit = useCallback((): boolean => {
    const found = validateRegister(
      name,
      email,
      password,
      confirmPassword,
      STRINGS.register.errors,
    );

    if (found.length > 0) {
      setErrors({
        name: found.find(e => e.field === 'name')?.message,
        email: found.find(e => e.field === 'email')?.message,
        password: found.find(e => e.field === 'password')?.message,
        confirm: found.find(e => e.field === 'confirm')?.message,
      });
      return false;
    }

    setErrors({});
    onSuccess(email.trim().toLowerCase());
    return true;
  }, [confirmPassword, email, name, onSuccess, password]);

  return {
    name,
    email,
    password,
    confirmPassword,
    errors,
    setName: handleNameChange,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    setConfirmPassword: handleConfirmChange,
    submit,
  };
}
