import { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing } from './theme';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  right?: ReactNode;
}

export const AppInput = ({ label, error, right, ...inputProps }: AppInputProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : undefined]}>
        <TextInput placeholderTextColor={colors.textSecondary} style={styles.input} {...inputProps} />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  inputRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center'
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.sm
  },
  inputError: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger,
    fontSize: 12
  }
});
