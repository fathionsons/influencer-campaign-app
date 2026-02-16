import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './theme';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState = ({ label = 'Loading...' }: LoadingStateProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="small" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14
  }
});
