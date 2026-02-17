import Constants from 'expo-constants';

import { isExpoGo } from '@/utils/platform';

const getNotifications = async () => {
  if (isExpoGo()) {
    throw new Error('Notifications require a development build (Expo Go limitation).');
  }

  const Notifications = await import('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false
    })
  });

  return Notifications;
};

export const ensureLocalNotificationPermission = async (): Promise<boolean> => {
  if (isExpoGo()) {
    return false;
  }

  const Notifications = await getNotifications();
  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const sendLocalTestNotification = async (): Promise<void> => {
  await sendLocalNotification('InfluenceHub Test', 'Notifications are configured and working.');
};

export const sendLocalNotification = async (title: string, body: string): Promise<void> => {
  if (isExpoGo()) {
    throw new Error('Expo Go does not support push notifications. Use a dev build.');
  }

  const hasPermission = await ensureLocalNotificationPermission();
  if (!hasPermission) {
    throw new Error('Notifications permission not granted');
  }

  const Notifications = await getNotifications();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body
    },
    trigger: null
  });
};

export const scheduleDeadlineReminder = async (
  title: string,
  body: string,
  triggerDate: Date
): Promise<string | null> => {
  if (isExpoGo()) {
    return null;
  }

  const hasPermission = await ensureLocalNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  if (triggerDate <= new Date()) {
    return null;
  }

  const Notifications = await getNotifications();
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate
    }
  });
};
