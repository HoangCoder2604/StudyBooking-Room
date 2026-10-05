import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BookingHistoryScreen from '../screens/BookingHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAppTheme } from '../services/ThemeContext';

const Tab = createBottomTabNavigator();
const icons = { Home: '⌂', Search: '⌕', Bookings: '▣', Profile: '●' };

export default function BottomTabs() {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShadowVisible: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor:colors.card, borderTopColor:colors.border },
      headerStyle: { backgroundColor:colors.card },
      headerTintColor: colors.text,
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>{icons[route.name]}</Text>
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings" component={BookingHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
