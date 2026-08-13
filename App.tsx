import React, { useEffect, useState, createRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, useNavigationState, type NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { storage } from './src/services/storage';

import {
  Manrope_800ExtraBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import NotificationPermissionScreen from './src/screens/NotificationPermissionScreen';
import { colors } from './src/theme';
import { MainTabs } from './src/components/GlassTabBar';
import { FloatingActionButton } from './src/components/FloatingActionButton';
import type { RootStackParamList } from './src/types/navigation';

SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator();

const ONBOARDING_KEY = 'hasSeenOnboarding';

const rootNavigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

function AppContent() {
  // Get the root navigation state (which includes the tab navigator state)
  const navigationState = useNavigationState((state) => state);
  
  // Find the MainTabs route and get its state
  const mainTabsRoute = navigationState?.routes.find((r) => r.name === 'MainTabs');
  const tabsState = mainTabsRoute?.state;
  const activeTabRoute = tabsState?.routes[tabsState?.index ?? 0];
  const activeTabName = activeTabRoute?.name;
  // Inside the Tasks stack, the FAB only makes sense on the root screen (TaskList).
  const tasksStackIndex = activeTabRoute?.state?.index ?? 0;

  // Show FAB only on the Tasks tab root screen (TaskList)
  const showFAB = activeTabName === 'Tasks' && tasksStackIndex === 0;

  return (
    <>
      <MainTabs />
      {showFAB && (
        <FloatingActionButton
          onPress={() => {
            // Navigate to TaskForm through the Tasks stack using root navigation
            if (rootNavigationRef.current) {
              rootNavigationRef.current.navigate('MainTabs', {
                screen: 'Tasks',
                params: { screen: 'TaskForm', params: {} }
              });
            }
          }}
          icon="+"
          variant="primary"
        />
      )}
    </>
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

  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    storage.getItem(ONBOARDING_KEY).then((val) => {
      if (mounted) {
        setInitialRoute(val === 'true' ? 'MainTabs' : 'Onboarding1');
      }
    });
    return () => { mounted = false; };
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
      <NavigationContainer ref={rootNavigationRef}>
        <RootStack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="Onboarding1" component={OnboardingScreen1} />
          <RootStack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <RootStack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          <RootStack.Screen name="MainTabs" component={AppContent} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}