// src/navigation/RootNavigator.js
// Fitur 1 (Splash) & 2 (Onboarding) ditangani di sini sebelum masuk ke
// AuthNavigator (belum login) atau MainTabNavigator (sudah login).

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen, { ONBOARDING_KEY } from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

export default function RootNavigator() {
  const { isLoading, isAuthenticated, bootstrapAuth } = useAuthStore();
  const [hasOnboarded, setHasOnboarded] = useState(null); // null = belum dicek

  useEffect(() => {
    bootstrapAuth();
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasOnboarded(value === 'true');
    });
  }, []);

  // Tunggu kedua pengecekan (token & status onboarding) selesai
  if (isLoading || hasOnboarded === null) {
    return <SplashScreen />;
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onFinish={() => setHasOnboarded(true)} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
