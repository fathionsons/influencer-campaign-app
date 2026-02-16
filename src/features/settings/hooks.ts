import { useMemo } from 'react';

import {
  ensureLocalNotificationPermission,
  sendLocalTestNotification
} from '@/lib/onesignal/localNotifications';
import { setPushOptIn } from '@/lib/onesignal/service';
import { useUiStore } from '@/stores/uiStore';

export const useSettings = () => {
  const notificationsEnabled = useUiStore((state) => state.notificationsEnabled);
  const timezone = useUiStore((state) => state.timezone);
  const setNotificationsEnabled = useUiStore((state) => state.setNotificationsEnabled);
  const setTimezone = useUiStore((state) => state.setTimezone);

  return useMemo(
    () => ({
      notificationsEnabled,
      timezone,
      updateNotifications: async (enabled: boolean) => {
        setNotificationsEnabled(enabled);
        setPushOptIn(enabled);

        if (enabled) {
          await ensureLocalNotificationPermission();
        }
      },
      updateTimezone: (nextTimezone: string) => {
        setTimezone(nextTimezone);
      },
      sendTestNotification: async () => {
        await sendLocalTestNotification();
      }
    }),
    [notificationsEnabled, setNotificationsEnabled, setTimezone, timezone]
  );
};
