import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from './theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700'
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});
