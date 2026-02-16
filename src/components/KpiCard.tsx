import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { colors } from './theme';

interface KpiCardProps {
  label: string;
  value: string;
}

export const KpiCard = ({ label, value }: KpiCardProps): JSX.Element => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  value: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800'
  }
});
