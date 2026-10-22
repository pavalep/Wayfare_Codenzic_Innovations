import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {useLoginForm} from '../../hooks/useLoginForm';
import {useAppRouter} from '../../navigation';
import {useAuthStore} from '../../state';
import {colors, spacing} from '../../theme';
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
 */
const LoginScreen: React.FC = () => {
  const {goToRegister, goToSetLocations} = useAppRouter();
  const signIn = useAuthStore(state => state.signIn);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {email, password, errors, setEmail, setPassword, submit} =
    useLoginForm(value => {
      signIn(value);
      goToSetLocations();
    });

  return (
    <AppScreen edges={['top', 'bottom']}>
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

      <View style={styles.footer}>
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
      </View>
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
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
