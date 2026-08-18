import React from 'react';
import { View, StyleProp, ViewStyle, Pressable, Text as RNText, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  colors,
  typography,
  borderRadius,
  shadows,
  useResponsive,
  useBottomLayout,
} from '../theme';

type GlassTabBarProps = BottomTabBarProps;

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Focus', label: 'Ahora', icon: 'timer-outline' },
  { name: 'Tasks', label: 'Tareas', icon: 'format-list-checks' },
  { name: 'History', label: 'Historial', icon: 'history' },
  { name: 'Profile', label: 'Perfil', icon: 'account-circle-outline' },
] as const;

export function GlassTabBar({ state, navigation }: GlassTabBarProps) {
  const { scale: s } = useResponsive();
  const { tabBarHeight, tabBarOffset } = useBottomLayout();

  const iconSize = s(22);
  const horizontalPadding = s(8);
  const labelMarginTop = s(2);

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

const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle: { backgroundColor: colors['inverse-surface'] },
  headerTintColor: colors['inverse-on-surface'],
  headerTitleStyle: { fontWeight: '600' as const },
};

function FocusStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="FocusMain" component={FocusScreen} options={{ title: 'Ahora' }} />
    </Stack.Navigator>
  );
}

function TasksStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tareas' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Nueva tarea' }} />
      <Stack.Screen name="StepForm" component={StepFormScreen} options={{ title: 'Nuevo paso' }} />
      <Stack.Screen name="StepComplete" component={StepCompleteScreen} options={{ title: 'Progreso', headerShown: false }} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} options={{ title: 'Historial' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="SyncConflict" component={SyncConflictScreen} />
    </Stack.Navigator>
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