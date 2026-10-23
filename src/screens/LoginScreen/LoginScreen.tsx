import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {useLoginForm} from '../../hooks/useLoginForm';
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
 * Screen 1 — Log in.
 *
 * The Figma frame is 420 × 880 with a 35.5 px status bar at the top
 * and a 138 px footer bar at the bottom. Everything between is the
 * scrollable form area:
 *
 *   40    the 56 px logo mark
 *   124   "Welcome back" — ExtraBold 32 px
 *   168.8 the subtitle — Regular 15 px
 *   221.1 the form — two labelled fields, 16 px apart
 *   429.2 "Forgot password?" — brand coloured
 *
 * The footer is pinned: the "Log in" button and the sign-up prompt
 * never scroll away.
 *
 * WHO CAN LOG IN
 *
 * Only the accounts created on the register screen. There is no
 * backend, so the accounts registered on this device are the only
 * accounts there are, and they are the source of truth: an email that
 * was never registered is refused with a message that points at the
 * register screen, and a password that does not match the one the
 * account was created with is refused on the password field.
 *
 * THE KEYBOARD
 *
 * There is nothing to do about the keyboard here, and that is a
 * deliberate decision rather than an omission.
 *
 * The form is short — two fields — and it ends well above where the
 * keyboard appears, so the fields are never covered by it. The
 * keyboard simply sits over the bottom of the screen, which is where
 * the footer is, and the footer stays exactly where it is.
 *
 * That is the behaviour a form should have: the primary action does
 * not jump up and down as the keyboard opens and closes. The screen
 * that does need to make room is the register screen, whose form is
 * long enough for the keyboard to reach the fields.
 */
const LoginScreen: React.FC = () => {
  const {goToRegister, goToSetLocations} = useAppRouter();
  const signIn = useAuthStore(state => state.signIn);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  /**
   * The credential check, and what happens when it passes.
   *
   * The store decides whether the account exists and whether the
   * password is right; the hook turns a refusal into an error on the
   * field that caused it. Only a successful check moves the user on.
   */
  const {email, password, errors, setEmail, setPassword, submit} =
    useLoginForm((typedEmail, typedPassword) => {
      const result = signIn(typedEmail, typedPassword);

      if (result === 'ok') {
        goToSetLocations();
      }

      return result;
    });

  return (
    <AppScreen edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppIcon name="logo" size={56} />

        <AppText variant="display" style={styles.title}>
          {STRINGS.login.title}
        </AppText>

        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          {STRINGS.login.subtitle}
        </AppText>

        <View style={styles.form}>
          <AppTextInput
            label={STRINGS.login.emailLabel}
            leadingIcon="email"
            placeholder={STRINGS.login.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            testID="login-email"
          />

          <View style={styles.fieldGap}>
            <AppTextInput
              label={STRINGS.login.passwordLabel}
              leadingIcon="lock"
              trailingIcon={isPasswordVisible ? 'eyeOff' : 'eye'}
              trailingAccessibilityLabel={
                isPasswordVisible ? 'Hide password' : 'Show password'
              }
              onPressTrailingIcon={() => setIsPasswordVisible(v => !v)}
              placeholder={STRINGS.login.passwordPlaceholder}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              testID="login-password"
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            // No recovery flow in this build — the control is part of
            // the design and is wired to the screen it belongs to.
          }}
          hitSlop={8}
          style={styles.forgot}>
          <AppText variant="buttonSm" tone="brand">
            {STRINGS.login.forgotPassword}
          </AppText>
        </Pressable>
      </ScrollView>

      <AppFooter>
        <AppButton
          label={STRINGS.login.submit}
          onPress={submit}
          testID="login-submit"
        />

        <View style={styles.signUp}>
          <AppText variant="centered" tone="secondary">
            {STRINGS.login.newToBrand}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={goToRegister}
            hitSlop={8}>
            <AppText variant="buttonSm" tone="primary">
              {STRINGS.login.createAccount}
            </AppText>
          </Pressable>
        </View>
      </AppFooter>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
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
  forgot: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
  signUp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
});

export default LoginScreen;
