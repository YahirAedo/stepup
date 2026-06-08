import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import FocusScreen    from './src/screens/FocusScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import HistoryScreen  from './src/screens/HistoryScreen';

export type RootTabParamList = {
  Focus:   undefined;
  Tasks:   undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle:      { backgroundColor: '#1A3A5C' },
            headerTintColor:  '#FFFFFF',
            headerTitleStyle: { fontWeight: '600' },
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
            component={FocusScreen}
            options={{
              title: 'Ahora',
              tabBarLabel: 'Ahora',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>▶</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Tasks"
            component={TaskListScreen}
            options={{
              title: 'Tareas',
              tabBarLabel: 'Tareas',
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>☑</Text>
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'Historial',
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