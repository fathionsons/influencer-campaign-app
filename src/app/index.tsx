import { Redirect } from 'expo-router';

import { LoadingState, Screen } from '@/components';
import { useAuth } from '@/features/auth';

export default function IndexPage(): JSX.Element {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading session..." />
      </Screen>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
