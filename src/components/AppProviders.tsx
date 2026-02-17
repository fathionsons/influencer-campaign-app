import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/reactQuery';
import { isExpoGo } from '@/utils/platform';

export const AppProviders = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    if (isExpoGo()) {
      LogBox.ignoreLogs([
        'expo-notifications functionality is not fully supported in Expo Go',
        'expo-notifications: Android Push notifications (remote notifications)'
      ]);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
};
