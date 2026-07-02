import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import {
  Manrope_800ExtraBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import FocusScreen      from './src/screens/FocusScreen';
import TaskListScreen   from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TaskFormScreen   from './src/screens/TaskFormScreen';
import StepFormScreen   from './src/screens/StepFormScreen';
import HistoryScreen    from './src/screens/HistoryScreen';

SplashScreen.preventAutoHideAsync();

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle:      { backgroundColor: '#1A3A5C' },
  headerTintColor:  '#FFFFFF',
  headerTitleStyle: { fontWeight: '600' as const },
};

// Stack de tareas: Lista → Detalle → Formularios
function TasksStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="TaskList"   component={TaskListScreen}   options={{ title: 'Tareas' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="TaskForm"   component={TaskFormScreen}   options={{ title: 'Nueva tarea' }} />
      <Stack.Screen name="StepForm"   component={StepFormScreen}   options={{ title: 'Nuevo paso' }} />
    </Stack.Navigator>
  );
}

// Stack de Vista Foco (necesita acceso a Tasks para navegar)
function FocusStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="FocusMain" component={FocusScreen} options={{ title: 'Ahora' }} />
    </Stack.Navigator>
  );
}

// Stack de Historial
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} options={{ title: 'Historial' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    Manrope_800ExtraBold,
    Manrope_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor:   '#2563EB',
            tabBarInactiveTintColor: '#94A3B8',
            tabBarStyle: {
              borderTopColor: '#E2E8F0',
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}