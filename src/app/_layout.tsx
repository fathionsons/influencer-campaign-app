import { Stack } from 'expo-router';

import { AppProviders } from '@/components';
import { AuthProvider } from '@/features/auth';

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#F4F7F5'
            }
          }}
        />
      </AuthProvider>
    </AppProviders>
  );
}
