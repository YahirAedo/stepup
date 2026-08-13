import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  NotificationPermission: undefined;
  MainTabs: NavigatorScreenParams<Record<string, object | undefined>> | undefined;
};