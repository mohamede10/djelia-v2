import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../config/colors';
import { BookDetailScreen } from '../screens/books/BookDetailScreen';
import { BooksScreen } from '../screens/books/BooksScreen';

const BookStack = createNativeStackNavigator();

export const BookStackNavigator = () => (
  <BookStack.Navigator screenOptions={{ headerShown: false }}>
    <BookStack.Screen name="BooksHome" component={BooksScreen} />
    <BookStack.Screen
      name="BookDetail"
      component={BookDetailScreen}
      options={{
        headerShown: true,
        title: '',
        headerTransparent: true,
        headerTintColor: colors.primary,
      }}
    />
  </BookStack.Navigator>
);