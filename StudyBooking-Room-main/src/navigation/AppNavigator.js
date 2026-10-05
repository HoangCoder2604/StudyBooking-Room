import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpScreen from '../screens/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
import { useAuth } from '../services/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: 'Back', headerShadowVisible: false }}>
      {!user ? <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} /> : <>
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Room Details' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Confirm Booking' }} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Trợ giúp' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Giới thiệu' }} />
      </>}
    </Stack.Navigator>
  );
}
