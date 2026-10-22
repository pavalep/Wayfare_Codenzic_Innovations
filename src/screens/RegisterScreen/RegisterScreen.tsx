import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {useRegisterForm} from '../../hooks/useRegisterForm';
import {useAppRouter} from '../../navigation';
import {useAuthStore} from '../../state';
import {colors, spacing} from '../../theme';
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
 * There is no backend, so "creating" an account records the session
 * locally — exactly what `signIn` does. The credential rules are the
 * login form's rules plus a name and a confirmation.
 */
const RegisterScreen: React.FC = () => {
  const {goBack, goToSetLocations} = useAppRouter();
  const signIn = useAuthStore(state => state.signIn);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

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
  } = useRegisterForm(value => {
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
          {STRINGS.register.title}
        </AppText>

        <AppText variant="body" tone="secondary" style={styles.subtitle}>
          {STRINGS.register.subtitle}
        </AppText>

        <View style={styles.form}>
          <AppTextInput
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

      <View style={styles.footer}>
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
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
