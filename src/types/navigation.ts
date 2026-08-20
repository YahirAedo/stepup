import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Task } from './index';

export type FocusStackParamList = {
  FocusMain: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskForm: { task?: Task };
  StepForm: { taskId: number; stepId?: number };
  StepComplete: { stepName: string; stepDuration?: number; nextStepName?: string };
};

export type HistoryStackParamList = {
  HistoryMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Badges: undefined;
  SyncConflict: undefined;
};

export type MainTabParamList = {
  Focus: NavigatorScreenParams<FocusStackParamList> | undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList> | undefined;
  History: NavigatorScreenParams<HistoryStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  NotificationPermission: undefined;
Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};
