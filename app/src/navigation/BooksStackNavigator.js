// src/navigation/BooksStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/books/HomeScreen';
import AddBookScreen from '../screens/books/AddBookScreen';
import SearchBookScreen from '../screens/books/SearchBookScreen';
import BarcodeScannerScreen from '../screens/books/BarcodeScannerScreen';
import BookDetailScreen from '../screens/books/BookDetailScreen';
import EditBookScreen from '../screens/books/EditBookScreen';
import UpdateProgressScreen from '../screens/books/UpdateProgressScreen';
import ReadBookScreen from '../screens/books/ReadBookScreen';
import GutenbergReaderScreen from '../screens/books/GutenbergReaderScreen';
import PDFReaderScreen from '../screens/books/PDFReaderScreen';
import WriteReviewScreen from '../screens/reviews/WriteReviewScreen';

const Stack = createNativeStackNavigator();

export default function BooksStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddBook" component={AddBookScreen} />
      <Stack.Screen name="SearchBook" component={SearchBookScreen} />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="EditBook" component={EditBookScreen} />
      <Stack.Screen name="UpdateProgress" component={UpdateProgressScreen} />
      <Stack.Screen name="ReadBook" component={ReadBookScreen} />
      <Stack.Screen name="GutenbergReader" component={GutenbergReaderScreen} />
      <Stack.Screen name="PDFReader" component={PDFReaderScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
    </Stack.Navigator>
  );
}
