import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export const ensureLocalNotificationPermission = async (): Promise<boolean> => {
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
  const hasPermission = await ensureLocalNotificationPermission();
  if (!hasPermission) {
    throw new Error('Notifications permission not granted');
  }

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
  const hasPermission = await ensureLocalNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  if (triggerDate <= new Date()) {
    return null;
  }

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
