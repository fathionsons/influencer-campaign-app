import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from './theme';

interface SegmentedControlOption<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

export const SegmentedControl = <T extends string | number>({
  options,
  value,
  onChange
}: SegmentedControlProps<T>): JSX.Element => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[styles.item, isActive ? styles.itemActive : undefined]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : undefined]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 3
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm
  },
  itemActive: {
    backgroundColor: colors.accentSoft
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13
  },
  labelActive: {
    color: colors.accent
  }
});
