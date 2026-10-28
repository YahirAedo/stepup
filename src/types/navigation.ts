import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Task } from './index';

export type FocusStackParamList = {
  FocusMain: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskOrder: { taskId: number; pendingDeleteIds?: ReadonlyArray<number> };
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
  /** Preview Focus — Paso completado v2 (#296). */
  FocusCompletado: undefined;
  /** Variante elegida — Enfoque: título protagonista en panel inset + cola colapsada (#296). */
  EnfoqueFocus: undefined;
  /** Estado vacío del flujo Focus — sin tareas activas (#296). */
  FocusSinTareas: undefined;
  /** Flujo Tareas Variante A — Listado. */
  TareasAListado: undefined;
  /** Flujo Tareas Variante A — Crear tarea. */
  TareasACrear: undefined;
  /** Flujo Tareas Variante A — Detalle. */
  TareasADetalle: undefined;
  /** Flujo Tareas Variante A — Editar tarea. */
  TareasAEditar: { ordenarPasos?: boolean } | undefined;
  /** Flujo Tareas Variante A — Aviso calmo de tarea completada. */
  TareasACompletada: undefined;
  /** Propuesta unica "Editar paso" como bottom sheet (compartida). */
  TareasEditarPasoSheet: undefined;
  /** Variante A de Perfil — tarjetas por sección. */
  PerfilA: undefined;
  /** Marco con tabs (Foco / Tareas / Perfil) con la barra puesta, dentro del layout. */
  SereneTabs: undefined;
  /** Flujo Perfil Variante A — Tus logros (rediseño Serene). */
  LogrosA: undefined;
  /** Flujo Perfil Variante A — Conflictos de sincronización (rediseño Serene). */
  ConflictosA: undefined;
  /** Onboarding rediseñado — Paso 1: el problema. */
  Onboarding1A: undefined;
  /** Onboarding rediseñado — Paso 2: la solución. */
  Onboarding2A: undefined;
  /** Login rediseñado — 6 estados de demo (Design Lab). */
  LoginA: undefined;
  /** Registro rediseñado — 4 estados de demo (Design Lab). */
  RegistroA: undefined;
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
