import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { BookingProvider } from './src/services/BookingContext';
import { AuthProvider, useAuth } from './src/services/AuthContext';
import { ThemeProvider, useAppTheme } from './src/services/ThemeContext';

function AppContent() {
  const { loading, user } = useAuth();
  const { dark, colors } = useAppTheme();
  const baseTheme = dark ? DarkTheme : DefaultTheme;
  const navigationTheme = { ...baseTheme, colors:{ ...baseTheme.colors, primary:colors.primary, background:colors.background, card:colors.card, text:colors.text, border:colors.border, notification:colors.danger } };
  if (loading) return <View style={[styles.loading,{backgroundColor:colors.background}]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <BookingProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </BookingProvider>
  );
}

export default function App() {
  return <AuthProvider><ThemeProvider><AppContent /></ThemeProvider></AuthProvider>;
}

const styles = StyleSheet.create({loading:{flex:1,alignItems:'center',justifyContent:'center'}});
