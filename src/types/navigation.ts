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
  /** Design Lab — índice de previews de mockups (Design Lab #295). */
  DesignLab: undefined;
  /** Preview del mockup Focus Timer limpio (#295). */
  CronometroLimpio: undefined;
  /** Preview Focus — Paso previo con selector y cola (#296). */
  FocusPrevio: undefined;
  /** Preview Focus — Paso completado v2 (#296). */
  FocusCompletado: undefined;
  /** Variante elegida — Enfoque: título protagonista en panel inset + cola colapsada (#296). */
  EnfoqueFocus: undefined;
  /** Estado vacío del flujo Focus — sin tareas activas (#296). */
  FocusSinTareas: undefined;
  /** Preview Tareas — Listado con tarjeta en foco y cola de espera (#297). */
  TareasListado: undefined;
  /** Preview Tareas — Detalle con secuencia de pasos (#297). */
  TareasDetalle: undefined;
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
