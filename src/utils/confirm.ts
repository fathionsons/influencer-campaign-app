import { Alert } from 'react-native';

export const confirmAction = (
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void
): void => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel'
    },
    {
      text: confirmText,
      onPress: onConfirm,
      style: 'destructive'
    }
  ]);
};
