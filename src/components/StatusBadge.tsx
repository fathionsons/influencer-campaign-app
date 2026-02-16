import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from './theme';

interface StatusBadgeProps {
  label: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}

export const StatusBadge = ({ label, tone = 'default' }: StatusBadgeProps): JSX.Element => {
  return (
    <View style={[styles.badge, tone === 'warning' && styles.warning, tone === 'danger' && styles.danger, tone === 'success' && styles.success]}>
      <Text
        style={[
          styles.label,
          tone === 'warning' && styles.warningLabel,
          tone === 'danger' && styles.dangerLabel,
          tone === 'success' && styles.successLabel
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft
  },
  warning: {
    backgroundColor: '#FEF3C7'
  },
  danger: {
    backgroundColor: '#FEE2E2'
  },
  success: {
    backgroundColor: '#DCFCE7'
  },
  label: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize'
  },
  warningLabel: {
    color: colors.warning
  },
  dangerLabel: {
    color: colors.danger
  },
  successLabel: {
    color: colors.success
  }
});
