import React from 'react';
import { AuthProvider } from './src/services/AuthContext';
import { BookingProvider } from './src/services/BookingContext';
import WebApp from './src/web/WebApp';

export default function App() {
  return <AuthProvider><BookingProvider><WebApp /></BookingProvider></AuthProvider>;
}

