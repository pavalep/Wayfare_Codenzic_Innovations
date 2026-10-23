import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {STRINGS} from '../../constants';
import {useKeyboardAwareForm} from '../../hooks/useKeyboardAwareForm';
import {useRegisterForm} from '../../hooks/useRegisterForm';
import {useAppRouter} from '../../navigation';
import {useAuthStore} from '../../state';
import {spacing} from '../../theme';
import {AppFooter} from '../../components/core/AppFooter';
import {AppButton} from '../../components/core/AppButton';
import {AppIcon} from '../../components/core/AppIcon';
import {AppScreen} from '../../components/core/AppScreen';
import {AppText} from '../../components/core/AppText';
import {AppTextInput} from '../../components/core/AppTextInput';

/**
 * Screen 1b — Create an account.
 *
 * WHY THIS SCREEN EXISTS
 *
 * The assignment says the login screen must "provide the login action
 * and the option for a new user to create an account". The Figma
 * draws the option — "Create an account" at the foot of the login
 * screen — but supplies no frame for where it goes, so it was
 * rendered as an inert link.
 *
 * This screen is that frame. There is no design to copy, so it is
 * built from the login screen's own structure, unchanged:
 *
 *   logo → title → subtitle → labelled fields → pinned footer
 *
 * The logo mark, the title style, the field component, the button
 * and the footer prompt are all the same components the login screen
 * uses, so the two screens read as one product rather than as a
 * login screen with a stranger bolted on.
 *
 * There is no backend, so "creating" an account records it on the
 * device — the account store in `src/state/authStore.ts` is the only
 * registry there is, and it is what the login screen checks against.
 * The credential rules are the login form's rules plus a name and a
 * confirmation.
 *
 * REGISTERING DOES NOT SIGN YOU IN
 *
 * Creating an account and logging in are two different acts, and this
 * screen only does the first one. The account is recorded, an alert
 * says so, and the user is sent back to the login screen to log in
 * with the credentials they just chose.
 *
 * That is why the screen ends with `goBack` rather than
 * `goToSetLocations`: the login screen is the one that starts a
 * session, and the login screen is where the user should be after
 * registering.
 *
 * THE KEYBOARD
 *
 * This is the form with the most fields on it — four, the last of
 * them right at the bottom of the screen — so it is the one where
 * the keyboard matters.
 *
 * Two things happen, and they are deliberately kept apart:
 *
 *   • The FORM makes room. The scroll area is wrapped in a
 *     `KeyboardAvoidingView`, so when the keyboard opens the scroll
 *     area gets shorter instead of the keyboard covering it, and
 *     `useKeyboardAwareForm` scrolls whichever field the user is
 *     typing in back into the space that is left above the keyboard.
 *
 *   • The BUTTON does not move. The footer is outside that wrapper,
 *     so the "Create account" button stays exactly where it is. A
 *     primary action that jumps up when the keyboard opens and back
 *     down when it closes is unsettling to press — the button should
 *     be in the same place every time.
 *
 * The keyboard covers the footer while it is up, and that is fine:
 * the confirmation field is the last one and its keyboard key is the
 * submit key.
 */
const RegisterScreen: React.FC = () => {
  const {goBack} = useAppRouter();
  const register = useAuthStore(state => state.register);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {scrollRef, onViewportLayout, field} = useKeyboardAwareForm();

  /**
   * The top safe-area inset.
   *
   * `KeyboardAvoidingView` compares its own height with the
   * keyboard's position on the SCREEN, but its own height is
   * measured from its parent — which sits below the status bar. The
   * offset puts the two back into the same coordinate space, so the
   * scroll area ends exactly on the keyboard's top edge rather than
   * the status-bar's worth of it below.
   */
  const insets = useSafeAreaInsets();

  const {
    name,
    email,
    password,
    confirmPassword,
    errors,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    submit,
  } = useRegisterForm((typedName, typedEmail, typedPassword) => {
    const result = register(typedName, typedEmail, typedPassword);

    if (result === 'ok') {
      /**
       * The account exists now, but the session does not.
       *
       * The alert's only button sends the user back to the login
       * screen, where they log in with what they just registered.
       * That is the whole point of not auto-signing-in: the two
       * actions stay separate and each one is done on purpose.
       */
      Alert.alert(
        STRINGS.register.successTitle,
        STRINGS.register.successMessage,
        [
          {
            text: STRINGS.register.successAction,
            onPress: goBack,
          },
        ],
        {cancelable: false},
      );
    }

    return result;
  });

  return (
    <AppScreen edges={['top']}>
      {/*
        The form is the part that has to move. The footer below it
        does not.
      */}
      <KeyboardAvoidingView
        behavior="height"
        keyboardVerticalOffset={insets.top}
        style={styles.keyboard}>
        <ScrollView
          ref={scrollRef}
          onLayout={onViewportLayout}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AppIcon name="logo" size={56} />

          <AppText variant="display" style={styles.title}>
            {STRINGS.register.title}
          </AppText>

          <AppText variant="body" tone="secondary" style={styles.subtitle}>
            {STRINGS.register.subtitle}
          </AppText>

          <View style={styles.form}>
            <AppTextInput
              {...field('name')}
              label={STRINGS.register.nameLabel}
              leadingIcon="person"
              placeholder={STRINGS.register.namePlaceholder}
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              testID="register-name"
            />

            <View style={styles.fieldGap}>
              <AppTextInput
                {...field('email')}
                label={STRINGS.register.emailLabel}
                leadingIcon="email"
                placeholder={STRINGS.register.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                testID="register-email"
              />
            </View>

            <View style={styles.fieldGap}>
              <AppTextInput
                {...field('password')}
                label={STRINGS.register.passwordLabel}
                leadingIcon="lock"
                trailingIcon={isPasswordVisible ? 'eyeOff' : 'eye'}
                trailingAccessibilityLabel={
                  isPasswordVisible ? 'Hide password' : 'Show password'
                }
                onPressTrailingIcon={() => setIsPasswordVisible(v => !v)}
                placeholder={STRINGS.register.passwordPlaceholder}
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                testID="register-password"
              />
            </View>

            <View style={styles.fieldGap}>
              <AppTextInput
                {...field('confirm')}
                label={STRINGS.register.confirmLabel}
                leadingIcon="lock"
                trailingIcon={isConfirmVisible ? 'eyeOff' : 'eye'}
                trailingAccessibilityLabel={
                  isConfirmVisible ? 'Hide password' : 'Show password'
                }
                onPressTrailingIcon={() => setIsConfirmVisible(v => !v)}
                placeholder={STRINGS.register.confirmPlaceholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirm}
                secureTextEntry={!isConfirmVisible}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={submit}
                testID="register-confirm"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppFooter>
        <AppButton
          label={STRINGS.register.submit}
          onPress={submit}
          testID="register-submit"
        />

        <View style={styles.signIn}>
          <AppText variant="centered" tone="secondary">
            {STRINGS.register.haveAccount}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            hitSlop={8}>
            <AppText variant="buttonSm" tone="primary">
              {STRINGS.register.signIn}
            </AppText>
          </Pressable>
        </View>
      </AppFooter>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  /**
   * The scroll area's wrapper.
   *
   * It fills the space above the footer, and the
   * `KeyboardAvoidingView` shortens it when the keyboard arrives.
   */
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginTop: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.xxl,
  },
  fieldGap: {
    marginTop: spacing.lg,
  },
  signIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
});

export default RegisterScreen;
