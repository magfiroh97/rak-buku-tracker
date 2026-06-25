// src/navigation/MainTabNavigator.js
// Bottom tabs utama setelah login: Rak Buku, Koleksi, Statistik, Profil.
// Masing-masing tab punya stack sendiri (lihat *StackNavigator.js) sehingga
// total 25 fitur tersebar rapi tapi tetap saling terhubung lewat navigasi antar-stack.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import BooksStackNavigator from './BooksStackNavigator';
import CollectionStackNavigator from './CollectionStackNavigator';
import StatsStackNavigator from './StatsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  BooksTab: 'library',
  CollectionTab: 'grid',
  StatsTab: 'stats-chart',
  ProfileTab: 'person',
};

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="BooksTab" component={BooksStackNavigator} options={{ title: 'Rak Buku' }} />
      <Tab.Screen name="CollectionTab" component={CollectionStackNavigator} options={{ title: 'Koleksi' }} />
      <Tab.Screen name="StatsTab" component={StatsStackNavigator} options={{ title: 'Statistik' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
