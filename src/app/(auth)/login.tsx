import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppInput, Button, Card, ErrorBanner, Screen, SectionTitle, colors, spacing } from '@/components';
import { useAuth } from '@/features/auth';
import { toErrorMessage } from '@/utils/format';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setErrorMessage(toErrorMessage(error, 'Unable to sign in'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrapper}>
        <SectionTitle
          title="InfluenceHub"
          subtitle="Sign in to manage campaigns, content approvals, and influencer operations."
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
            placeholder="••••••••"
            secureTextEntry
            value={password}
          />
          <Button
            disabled={submitting || email.length === 0 || password.length < 6}
            label={submitting ? 'Signing in...' : 'Sign In'}
            onPress={() => void onSubmit()}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet?</Text>
          <Link href="/(auth)/signup" style={styles.link}>
            Create one
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
