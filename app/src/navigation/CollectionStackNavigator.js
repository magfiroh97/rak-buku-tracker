// src/navigation/CollectionStackNavigator.js
// Stack di balik tab "Koleksi". Menghubungkan Fitur 17-20: Review Saya,
// Wishlist, Favorit, dan Kategori — semua cara mengorganisir buku yang
// sudah ada di rak, dikumpulkan dalam satu tab supaya navigasi tidak
// terlalu banyak tab terpisah.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CollectionMenuScreen from '../screens/CollectionMenuScreen';
import WishlistScreen from '../screens/books/WishlistScreen';
import FavoritesScreen from '../screens/books/FavoritesScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import MyReviewsScreen from '../screens/reviews/MyReviewsScreen';
import BookDetailScreen from '../screens/books/BookDetailScreen';
import EditBookScreen from '../screens/books/EditBookScreen';
import UpdateProgressScreen from '../screens/books/UpdateProgressScreen';
import ReadBookScreen from '../screens/books/ReadBookScreen';
import WriteReviewScreen from '../screens/reviews/WriteReviewScreen';

const Stack = createNativeStackNavigator();

export default function CollectionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionMenu" component={CollectionMenuScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      {/* Screen ini dipakai ulang dari modul Buku supaya bisa dibuka dari Koleksi juga */}
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="EditBook" component={EditBookScreen} />
      <Stack.Screen name="UpdateProgress" component={UpdateProgressScreen} />
      <Stack.Screen name="ReadBook" component={ReadBookScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
    </Stack.Navigator>
  );
}
