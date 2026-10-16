import React from 'react';
import { View, StyleProp, ViewStyle, Pressable, Text as RNText, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type {
  MainTabParamList,
  FocusStackParamList,
  TasksStackParamList,
  HistoryStackParamList,
  ProfileStackParamList,
} from '../types/navigation';
import {
  colors,
  typography,
  borderRadius,
  shadows,
  useResponsive,
  useBottomLayout,
} from '../theme';

type GlassTabBarProps = BottomTabBarProps;

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS = [
  { name: 'Focus', label: 'Ahora', icon: 'timer-outline' },
  { name: 'Tasks', label: 'Tareas', icon: 'format-list-checks' },
  { name: 'History', label: 'Historial', icon: 'history' },
  { name: 'Profile', label: 'Perfil', icon: 'account-circle-outline' },
] as const;

/**
 * Pantallas del Design Lab que se muestran a pantalla completa, sin tab bar.
 * Los mockups no la incluyen y la pilora glass arruinaria la evaluacion
 * visual de la preview. Se ocultan leyendo el estado anidado del stack
 * porque la tab bar se renderiza desde el `Tab.Navigator` padre.
 * Issue: #295.
 */
const FULLSCREEN_ROUTES = new Set([
  'DesignLab',
  'CronometroLimpio',
  'FocusPrevio',
  'FocusCompletado',
  'EnfoqueFocus',
  'FocusSinTareas',
  'TareasListado',
  'TareasDetalle',
  'TareasAListado',
  'TareasACrear',
  'TareasADetalle',
  'TareasAEditar',
  'TareasACompletada',
  'TareasBListado',
  'TareasBCrear',
  'TareasBDetalle',
  'TareasBEditar',
  'TareasCListado',
  'TareasCCrear',
  'TareasCDetalle',
  'TareasCEditar',
  'TareasEditarPasoSheet',
  'PerfilA',
  'PerfilB',
  'PerfilC',
]);

export function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const { scale: s } = useResponsive();
  const { tabBarHeight, tabBarOffset } = useBottomLayout();

  const iconSize = s(22);
  const horizontalPadding = s(8);
  const labelMarginTop = s(2);

  const activeTabRoute = state.routes[state.index];
  const nestedState = activeTabRoute?.state;
  const nestedRouteName = nestedState?.routes?.[nestedState.index ?? 0]?.name;
  if (nestedRouteName && FULLSCREEN_ROUTES.has(nestedRouteName)) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: tabBarOffset,
        left: 16,
        right: 16,
        height: tabBarHeight,
        pointerEvents: 'box-none',
      } as StyleProp<ViewStyle>}
    >
      <View
        style={{
          flex: 1,
          height: tabBarHeight,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: borderRadius.full,
          ...shadows.ambient,
        }}
      >
        {state.routes.map((route: { name: string; key: string }, index: number) => {
          const tabInfo = TABS.find((t) => t.name === route.name);
          const isFocused = state.index === index;
          const iconName = tabInfo?.icon ?? 'help-circle-outline';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={onPress}
              onLongPress={onLongPress}
              pointerEvents="box-only"
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tabInfo?.label}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={iconSize}
                color={isFocused ? colors['on-primary-container'] : colors['on-surface-variant']}
              />
              {tabInfo && (
                <View
                  style={{
                    marginTop: labelMarginTop,
                    borderRadius: borderRadius.full,
                    paddingHorizontal: horizontalPadding,
                    paddingVertical: s(2),
                    backgroundColor: isFocused ? colors['primary-container'] : 'transparent',
                    transform: [{ scale: isFocused ? 0.9 : 1 }],
                  }}
                >
                  <RNText style={[
                    typography['label-sm'] as TextStyle,
                    {
                      color: isFocused ? colors['on-primary-container'] : colors['on-surface-variant'],
                    } as TextStyle,
                  ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {tabInfo.label}
                  </RNText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FocusScreen from '../screens/FocusScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import StepFormScreen from '../screens/StepFormScreen';
import StepCompleteScreen from '../screens/StepCompleteScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BadgesScreen from '../screens/BadgesScreen';
import SyncConflictScreen from '../screens/SyncConflictScreen';
import DesignLabScreen from '../screens/designlab/DesignLabScreen';
import CronometroLimpioScreen from '../screens/designlab/CronometroLimpioScreen';
import FocusPrevioScreen from '../screens/designlab/FocusPrevioScreen';
import FocusCompletadoScreen from '../screens/designlab/FocusCompletadoScreen';
import EnfoqueFocusScreen from '../screens/designlab/EnfoqueFocusScreen';
import FocusSinTareasScreen from '../screens/designlab/FocusSinTareasScreen';
import TareasListadoScreen from '../screens/designlab/TareasListadoScreen';
import TareasDetalleScreen from '../screens/designlab/TareasDetalleScreen';
import TareasAListadoScreen from '../screens/designlab/TareasAListadoScreen';
import TareasACrearScreen from '../screens/designlab/TareasACrearScreen';
import TareasADetalleScreen from '../screens/designlab/TareasADetalleScreen';
import TareasAEditarScreen from '../screens/designlab/TareasAEditarScreen';
import TareasACompletadaScreen from '../screens/designlab/TareasACompletadaScreen';
import TareasBListadoScreen from '../screens/designlab/TareasBListadoScreen';
import TareasBCrearScreen from '../screens/designlab/TareasBCrearScreen';
import TareasBDetalleScreen from '../screens/designlab/TareasBDetalleScreen';
import TareasBEditarScreen from '../screens/designlab/TareasBEditarScreen';
import TareasCListadoScreen from '../screens/designlab/TareasCListadoScreen';
import TareasCCrearScreen from '../screens/designlab/TareasCCrearScreen';
import TareasCDetalleScreen from '../screens/designlab/TareasCDetalleScreen';
import TareasCEditarScreen from '../screens/designlab/TareasCEditarScreen';
import TareasEditarPasoSheetScreen from '../screens/designlab/TareasEditarPasoSheetScreen';
import PerfilAVarianteScreen from '../screens/designlab/PerfilAVarianteScreen';
import PerfilBVarianteScreen from '../screens/designlab/PerfilBVarianteScreen';
import PerfilCVarianteScreen from '../screens/designlab/PerfilCVarianteScreen';

const FocusStackNav = createNativeStackNavigator<FocusStackParamList>();
const TasksStackNav = createNativeStackNavigator<TasksStackParamList>();
const HistoryStackNav = createNativeStackNavigator<HistoryStackParamList>();
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
      <TasksStackNav.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tareas' }} />
      <TasksStackNav.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalle' }} />
      <TasksStackNav.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Nueva tarea' }} />
      <TasksStackNav.Screen name="StepForm" component={StepFormScreen} options={{ title: 'Nuevo paso' }} />
      <TasksStackNav.Screen name="StepComplete" component={StepCompleteScreen} options={{ title: 'Progreso', headerShown: false }} />
    </TasksStackNav.Navigator>
  );
}

function HistoryStack() {
  return (
    <HistoryStackNav.Navigator screenOptions={screenOpts}>
      <HistoryStackNav.Screen name="HistoryMain" component={HistoryScreen} options={{ title: 'Historial' }} />
    </HistoryStackNav.Navigator>
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
      <ProfileStackNav.Screen name="FocusPrevio" component={FocusPrevioScreen} />
      <ProfileStackNav.Screen name="FocusCompletado" component={FocusCompletadoScreen} />
      <ProfileStackNav.Screen name="EnfoqueFocus" component={EnfoqueFocusScreen} />
      <ProfileStackNav.Screen name="FocusSinTareas" component={FocusSinTareasScreen} />
      <ProfileStackNav.Screen name="TareasListado" component={TareasListadoScreen} />
      <ProfileStackNav.Screen name="TareasDetalle" component={TareasDetalleScreen} />
      <ProfileStackNav.Screen name="TareasAListado" component={TareasAListadoScreen} />
      <ProfileStackNav.Screen name="TareasACrear" component={TareasACrearScreen} />
      <ProfileStackNav.Screen name="TareasADetalle" component={TareasADetalleScreen} />
      <ProfileStackNav.Screen name="TareasAEditar" component={TareasAEditarScreen} />
      <ProfileStackNav.Screen name="TareasACompletada" component={TareasACompletadaScreen} />
      <ProfileStackNav.Screen name="TareasBListado" component={TareasBListadoScreen} />
      <ProfileStackNav.Screen name="TareasBCrear" component={TareasBCrearScreen} />
      <ProfileStackNav.Screen name="TareasBDetalle" component={TareasBDetalleScreen} />
      <ProfileStackNav.Screen name="TareasBEditar" component={TareasBEditarScreen} />
      <ProfileStackNav.Screen name="TareasCListado" component={TareasCListadoScreen} />
      <ProfileStackNav.Screen name="TareasCCrear" component={TareasCCrearScreen} />
      <ProfileStackNav.Screen name="TareasCDetalle" component={TareasCDetalleScreen} />
      <ProfileStackNav.Screen name="TareasCEditar" component={TareasCEditarScreen} />
      <ProfileStackNav.Screen name="TareasEditarPasoSheet" component={TareasEditarPasoSheetScreen} />
      <ProfileStackNav.Screen name="PerfilA" component={PerfilAVarianteScreen} />
      <ProfileStackNav.Screen name="PerfilB" component={PerfilBVarianteScreen} />
      <ProfileStackNav.Screen name="PerfilC" component={PerfilCVarianteScreen} />
    </ProfileStackNav.Navigator>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen name="Focus" component={FocusStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}