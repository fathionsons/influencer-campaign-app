import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';

import { supabase } from '@/lib/supabase/client';
import { upsertLocalNotificationDevice } from '@/lib/localStore';
import { isSupabaseConfigured } from '@/utils/env';
import { getOptionalEnv } from '@/utils/env';
import { isExpoGo } from '@/utils/platform';

let initialized = false;

const oneSignalAppId = getOptionalEnv('EXPO_PUBLIC_ONESIGNAL_APP_ID');

export const initializeOneSignal = async (): Promise<boolean> => {
  if (!oneSignalAppId) {
    return false;
  }

  if (isExpoGo()) {
    return false;
  }

  if (initialized) {
    return true;
  }

  OneSignal.Debug.setLogLevel(LogLevel.Warn);
  OneSignal.initialize(oneSignalAppId);
  await OneSignal.Notifications.requestPermission(true);
  initialized = true;

  return true;
};

export const linkOneSignalToUser = async (userId: string): Promise<void> => {
  if (!oneSignalAppId || isExpoGo()) {
    return;
  }

  if (!initialized) {
    await initializeOneSignal();
  }

  OneSignal.login(userId);

  const [oneSignalId, pushToken] = await Promise.all([
    OneSignal.User.getOnesignalId(),
    OneSignal.User.pushSubscription.getTokenAsync()
  ]);

  if (!oneSignalId) {
    return;
  }

  if (!isSupabaseConfigured() || !supabase) {
    upsertLocalNotificationDevice({
      user_id: userId,
      one_signal_id: oneSignalId,
      platform: Device.osName ?? Platform.OS,
      push_token: pushToken ?? null
    });
    return;
  }

  const { error } = await supabase.from('notification_devices').upsert(
    {
      user_id: userId,
      one_signal_id: oneSignalId,
      platform: Device.osName ?? Platform.OS,
      push_token: pushToken
    },
    {
      onConflict: 'user_id,one_signal_id'
    }
  );

  if (error) {
    console.warn('Failed to upsert notification device', error.message);
  }
};

export const unlinkOneSignalUser = (): void => {
  if (!oneSignalAppId || !initialized || isExpoGo()) {
    return;
  }

  OneSignal.logout();
};

export const setPushOptIn = (enabled: boolean): void => {
  if (!oneSignalAppId || !initialized || isExpoGo()) {
    return;
  }

  if (enabled) {
    OneSignal.User.pushSubscription.optIn();
    return;
  }

  OneSignal.User.pushSubscription.optOut();
};

export const oneSignalEnabled = (): boolean => {
  return Boolean(oneSignalAppId) && !isExpoGo();
};
