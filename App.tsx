import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Manrope_800ExtraBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import FocusScreen from './src/screens/FocusScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import StepFormScreen from './src/screens/StepFormScreen';
import StepCompleteScreen from './src/screens/StepCompleteScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import NotificationPermissionScreen from './src/screens/NotificationPermissionScreen';
import { colors, typography } from './src/theme';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const screenOpts = {
  headerStyle: { backgroundColor: colors['inverse-surface'] },
  headerTintColor: colors['inverse-on-surface'],
  headerTitleStyle: { fontWeight: '600' as const },
};

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

function FocusStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="FocusMain" component={FocusScreen} options={{ title: 'Ahora' }} />
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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tertiary,
        tabBarInactiveTintColor: colors['on-surface-variant'],
        tabBarStyle: {
          borderTopColor: colors['outline-variant'],
          paddingBottom: 4,
          height: 58,
        },
      }}
    >
      <Tab.Screen
        name="Focus"
        component={FocusStack}
        options={{
          tabBarLabel: 'Ahora',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>▶</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{
          tabBarLabel: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>☑</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    Manrope_800ExtraBold,
    Manrope_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setInitialRoute(val === 'true' ? 'MainTabs' : 'Onboarding1');
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  if (fontsError) {
    console.warn('Font loading error:', fontsError);
  }

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="Onboarding1" component={OnboardingScreen1} />
          <RootStack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <RootStack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
