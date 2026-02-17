import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, spacing } from './theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
}

export const Screen = ({ children, scroll = false }: ScreenProps) => {
  if (scroll) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.base}>
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.content}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg
  }
});
