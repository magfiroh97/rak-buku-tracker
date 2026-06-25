// src/navigation/StatsStackNavigator.js
// Stack di balik tab "Statistik". Fitur 22 (Statistik), 23 (Target Tahunan),
// 24 (Riwayat Aktivitas).

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StatsScreen from '../screens/stats/StatsScreen';
import ActivitiesScreen from '../screens/stats/ActivitiesScreen';

const Stack = createNativeStackNavigator();

export default function StatsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsHome" component={StatsScreen} />
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
    </Stack.Navigator>
  );
}
