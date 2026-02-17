import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card, ErrorBanner, Screen, SectionTitle, colors, spacing } from '@/components';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { oneSignalEnabled } from '@/lib/onesignal/service';
import { APP_VERSION } from '@/utils/constants';
import { toErrorMessage } from '@/utils/format';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const settings = useSettings();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestNotification = async (): Promise<void> => {
    setErrorMessage(null);
    setLoading(true);

    try {
      await settings.sendTestNotification();
    } catch (error) {
      setErrorMessage(toErrorMessage(error, 'Unable to send test notification'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        }
      }
    ]);
  };

  return (
    <Screen scroll>
      <SectionTitle title="Settings" subtitle="Notifications, timezone display, and account" />

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Push notifications</Text>
            <Text style={styles.meta}>
              {oneSignalEnabled()
                ? 'OneSignal enabled (EAS build required for device testing).'
                : 'OneSignal App ID missing. Using local notifications only.'}
            </Text>
          </View>
          <Switch
            onValueChange={(value) => void settings.updateNotifications(value)}
            value={settings.notificationsEnabled}
          />
        </View>
        <Button
          label={loading ? 'Sending...' : 'Test notification'}
          onPress={() => void handleTestNotification()}
          variant="secondary"
        />
      </Card>

      <Card>
        <Text style={styles.label}>Timezone display</Text>
        <Text style={styles.meta}>{settings.timezone}</Text>
        <Button
          label="Use device timezone"
          onPress={() => settings.updateTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
          variant="secondary"
        />
      </Card>

      <Card>
        <Text style={styles.label}>Account</Text>
        <Button label="Sign out" onPress={handleSignOut} variant="danger" />
      </Card>

      <Text style={styles.versionText}>InfluenceHub v{APP_VERSION}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  rowText: {
    flex: 1
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  versionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12
  }
});
