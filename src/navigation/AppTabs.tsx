import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import { migrationFlags } from '../config/migration';
import SereneTabBar, { type SereneTabKey } from '../components/ui/SereneTabBar';
import { TAB_KEY_BY_ROUTE, TAB_ROUTES, isFullscreenRoute, type TabRouteName } from './tabs';
import type {
  FocusStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  TasksStackParamList,
} from '../types/navigation';

import FocusScreen from '../screens/FocusScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TasksListScreen from '../features/tasks/TasksListScreen';
import TaskDetailScreen from '../features/tasks/TaskDetailScreen';
import TaskEditScreen from '../features/tasks/TaskEditScreen';
import LegacyTaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import StepFormScreen from '../screens/StepFormScreen';
import StepCompleteScreen from '../screens/StepCompleteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BadgesScreen from '../screens/BadgesScreen';
import SyncConflictScreen from '../screens/SyncConflictScreen';
import DesignLabScreen from '../screens/designlab/DesignLabScreen';
import CronometroLimpioScreen from '../screens/designlab/CronometroLimpioScreen';
import FocusCompletadoScreen from '../screens/designlab/FocusCompletadoScreen';
import EnfoqueFocusScreen from '../screens/designlab/EnfoqueFocusScreen';
import FocusSinTareasScreen from '../screens/designlab/FocusSinTareasScreen';
import TareasAListadoScreen from '../screens/designlab/TareasAListadoScreen';
import TareasACrearScreen from '../screens/designlab/TareasACrearScreen';
import TareasADetalleScreen from '../screens/designlab/TareasADetalleScreen';
import TareasAEditarScreen from '../screens/designlab/TareasAEditarScreen';
import TareasACompletadaScreen from '../screens/designlab/TareasACompletadaScreen';
import TareasEditarPasoSheetScreen from '../screens/designlab/TareasEditarPasoSheetScreen';
import PerfilAVarianteScreen from '../screens/designlab/PerfilAVarianteScreen';
import SereneTabsScreen from '../screens/designlab/SereneTabsScreen';
import LogrosAScreen from '../screens/designlab/LogrosAScreen';
import ConflictosAScreen from '../screens/designlab/ConflictosAScreen';
import Onboarding1AScreen from '../screens/designlab/Onboarding1AScreen';
import Onboarding2AScreen from '../screens/designlab/Onboarding2AScreen';
import LoginAScreen from '../screens/designlab/LoginAScreen';
import RegistroAScreen from '../screens/designlab/RegistroAScreen';

/**
 * Navegador de 3 pestañas (Foco / Tareas / Perfil) con la barra del rediseño.
 *
 * Convive con `MainTabs` (GlassTabBar) hasta la Fase 7: `TABS_VARIANT` en
 * `./tabs` decide cual se monta. Las stacks se duplican a proposito para no
 * tocar `GlassTabBar.tsx`; si una fase agrega una pantalla, va en los dos
 * archivos hasta que el viejo se borre.
 *
 * Sin pestaña Historial: queda inaccesible hasta la Fase 3, cuando "Completadas"
 * viva dentro de Tareas. Ver `docs/MIGRACION.md`.
 */

const Tab = createBottomTabNavigator<MainTabParamList>();
const FocusStackNav = createNativeStackNavigator<FocusStackParamList>();
const TasksStackNav = createNativeStackNavigator<TasksStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

const screenOpts = {
  headerStyle: { backgroundColor: colors['inverse-surface'] },
  headerTintColor: colors['inverse-on-surface'],
  headerTitleStyle: { fontWeight: '600' as const },
};

function FocusStack() {
  return (
    <FocusStackNav.Navigator screenOptions={screenOpts}>
      <FocusStackNav.Screen name="FocusMain" component={FocusScreen} options={{ title: 'Ahora' }} />
    </FocusStackNav.Navigator>
  );
}

function TasksStack() {
  return (
    <TasksStackNav.Navigator screenOptions={screenOpts}>
      <TasksStackNav.Screen
        name="TaskList"
        component={migrationFlags.tasks ? TasksListScreen : TaskListScreen}
        options={{ title: 'Tareas' }}
      />
      <TasksStackNav.Screen
        name="TaskDetail"
        component={migrationFlags.tasks ? TaskDetailScreen : LegacyTaskDetailScreen}
        options={{ title: 'Detalle' }}
      />
      {migrationFlags.tasks && (
        <TasksStackNav.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Editar tarea' }} />
      )}
      <TasksStackNav.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Nueva tarea' }} />
      <TasksStackNav.Screen name="StepForm" component={StepFormScreen} options={{ title: 'Nuevo paso' }} />
      <TasksStackNav.Screen name="StepComplete" component={StepCompleteScreen} options={{ title: 'Progreso', headerShown: false }} />
    </TasksStackNav.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen name="Badges" component={BadgesScreen} />
      <ProfileStackNav.Screen name="SyncConflict" component={SyncConflictScreen} />
      <ProfileStackNav.Screen name="DesignLab" component={DesignLabScreen} />
      <ProfileStackNav.Screen name="CronometroLimpio" component={CronometroLimpioScreen} />
      <ProfileStackNav.Screen name="FocusCompletado" component={FocusCompletadoScreen} />
      <ProfileStackNav.Screen name="EnfoqueFocus" component={EnfoqueFocusScreen} />
      <ProfileStackNav.Screen name="FocusSinTareas" component={FocusSinTareasScreen} />
      <ProfileStackNav.Screen name="TareasAListado" component={TareasAListadoScreen} />
      <ProfileStackNav.Screen name="TareasACrear" component={TareasACrearScreen} />
      <ProfileStackNav.Screen name="TareasADetalle" component={TareasADetalleScreen} />
      <ProfileStackNav.Screen name="TareasAEditar" component={TareasAEditarScreen} />
      <ProfileStackNav.Screen name="TareasACompletada" component={TareasACompletadaScreen} />
      <ProfileStackNav.Screen name="TareasEditarPasoSheet" component={TareasEditarPasoSheetScreen} />
      <ProfileStackNav.Screen name="PerfilA" component={PerfilAVarianteScreen} />
      <ProfileStackNav.Screen name="SereneTabs" component={SereneTabsScreen} />
      <ProfileStackNav.Screen name="LogrosA" component={LogrosAScreen} />
      <ProfileStackNav.Screen name="ConflictosA" component={ConflictosAScreen} />
      <ProfileStackNav.Screen name="Onboarding1A" component={Onboarding1AScreen} />
      <ProfileStackNav.Screen name="Onboarding2A" component={Onboarding2AScreen} />
      <ProfileStackNav.Screen name="LoginA" component={LoginAScreen} />
      <ProfileStackNav.Screen name="RegistroA" component={RegistroAScreen} />
    </ProfileStackNav.Navigator>
  );
}

const STACKS: Record<TabRouteName, React.ComponentType<object>> = {
  Focus: FocusStack,
  Tasks: TasksStack,
  Profile: ProfileStack,
};

/**
 * Barra Serene dentro del tab navigator.
 *
 * `tabBarHideOnKeyboard` no funciona con un `tabBar` propio: la opcion la lee
 * `BottomTabBar` (`@react-navigation/bottom-tabs/views/BottomTabBar.js`), que
 * queda reemplazado. Se replica la misma semantica con un listener de teclado.
 */
function SereneTabBarHost({ state, navigation }: BottomTabBarProps) {
  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const activeRoute = state.routes[state.index];
  if (!activeRoute) return null;

  const nestedRouteName = activeRoute.state?.routes?.[activeRoute.state.index ?? 0]?.name;
  if (keyboardShown || isFullscreenRoute(nestedRouteName)) return null;

  const onSelect = (key: SereneTabKey) => {
    const routeName = TAB_ROUTES.find((name) => TAB_KEY_BY_ROUTE[name] === key);
    if (!routeName) return;
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  };

  return <SereneTabBar active={TAB_KEY_BY_ROUTE[activeRoute.name as TabRouteName]} onSelect={onSelect} />;
}

export default function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <SereneTabBarHost {...props} />}>
      {TAB_ROUTES.map((name) => (
        <Tab.Screen key={name} name={name} component={STACKS[name]} />
      ))}
    </Tab.Navigator>
  );
}
