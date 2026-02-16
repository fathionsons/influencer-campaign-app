import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppInput, Button, Card, ErrorBanner, Screen, SectionTitle, colors, spacing } from '@/components';
import { useAuth } from '@/features/auth';
import { toErrorMessage } from '@/utils/format';

export default function SignupScreen(): JSX.Element {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordsMatch = password === confirmPassword;

  const onSubmit = async (): Promise<void> => {
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signUp(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setErrorMessage(toErrorMessage(error, 'Unable to create account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrapper}>
        <SectionTitle
          title="Create account"
          subtitle="Start managing influencer campaigns and UGC approvals in one workspace."
        />

        <Card>
          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
          <AppInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@brand.com"
            value={email}
          />
          <AppInput
            label="Password"
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
          />
          <AppInput
            label="Confirm password"
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry
            value={confirmPassword}
          />
          <Button
            disabled={
              submitting ||
              email.length === 0 ||
              password.length < 6 ||
              confirmPassword.length < 6 ||
              !passwordsMatch
            }
            label={submitting ? 'Creating account...' : 'Sign Up'}
            onPress={() => void onSubmit()}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.link}>
            Sign in
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  link: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14
  }
});
