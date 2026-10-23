import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DjeliBotScreen } from '../screens/ai/DjeliBotScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { StoryDetailScreen } from '../screens/home/StoryDetailScreen';
import { LearnDetailScreen } from '../screens/learn/LearnDetailScreen';
import { LearnScreen } from '../screens/learn/LearnScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { ProductDetailScreen } from '../screens/marketplace/ProductDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SearchScreen } from '../screens/search/SearchScreen';

import { BookStackNavigator } from './BookStackNavigator';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../config/colors';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const LearnStack = createNativeStackNavigator();
const MarketStack = createNativeStackNavigator();

type TabIconProps = { label: string; focused: boolean; icon: any };
const TabIcon = ({ label, focused, icon }: TabIconProps) => (
  <View style={tabStyles.container}>
    <MaterialCommunityIcons 
      name={icon} 
      size={24} 
      color={focused ? colors.primary : colors.textLight} 
    />
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    {focused && <View style={tabStyles.activeDot} />}
  </View>
);

const tabStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: colors.primary,
    fontFamily: 'Poppins_700Bold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 4,
  },
});

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="Search" component={SearchScreen} />
    <HomeStack.Screen
      name="StoryDetail"
      component={StoryDetailScreen}
      options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: colors.primary }}
    />
  </HomeStack.Navigator>
);

const LearnStackNavigator = () => (
  <LearnStack.Navigator screenOptions={{ headerShown: false }}>
    <LearnStack.Screen name="LearnHome" component={LearnScreen} />
    <LearnStack.Screen
      name="LearnDetail"
      component={LearnDetailScreen}
      options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: colors.primary }}
    />
  </LearnStack.Navigator>
);

const MarketStackNavigator = () => (
  <MarketStack.Navigator screenOptions={{ headerShown: false }}>
    <MarketStack.Screen name="MarketHome" component={MarketplaceScreen} />
    <MarketStack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ headerShown: true, title: '', headerTransparent: true, headerTintColor: colors.primary }}
    />
  </MarketStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ headerShown: true, title: 'Profil', headerTintColor: colors.primary }}
    />
    <ProfileStack.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 90,
          paddingBottom: 25,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="book-open-variant" label="Biblio" focused={focused} /> }}
      />
      <Tab.Screen
        name="DjeliBot"
        component={DjeliBotScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="robot-outline" label="DjeliBot" focused={focused} /> }}
      />
      <Tab.Screen
        name="Langues"
        component={LearnStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="translate" label="Langues" focused={focused} /> }}
      />
      <Tab.Screen
      name="Livres"
      component={BookStackNavigator}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="book-open-page-variant" label="Livres" focused={focused} /> }}
/>
      <Tab.Screen
        name="Boutique"
        component={MarketStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="storefront-outline" label="Marché" focused={focused} /> }}
      />
      <Tab.Screen
        name="ProfilTab"
        component={ProfileStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="account-circle-outline" label="Profil" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
};
