import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const isExpoGo = (): boolean => Constants.appOwnership === 'expo';
export const isAndroid = (): boolean => Platform.OS === 'android';
