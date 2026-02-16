import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from './theme';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner = ({ message }: ErrorBannerProps): JSX.Element => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: spacing.md
  },
  text: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600'
  }
});
