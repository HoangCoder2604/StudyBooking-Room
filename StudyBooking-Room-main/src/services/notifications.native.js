import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { apiRequest } from './api';

const REMINDERS_KEY = 'study-room-notification-reminders';
let enabled = false;
let remoteRegistered = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner:true, shouldShowList:true, shouldPlaySound:true, shouldSetBadge:false })
});

export async function initializeNotifications({ token, notificationsEnabled }) {
  enabled = Boolean(notificationsEnabled);
  if (!enabled) return false;
  if (Device.osName === 'Android') {
    await Notifications.setNotificationChannelAsync('bookings', { name:'Booking updates', importance:Notifications.AndroidImportance.HIGH, vibrationPattern:[0,250,150,250] });
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return false;

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (Device.isDevice && projectId && token) {
    try {
      const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await apiRequest('/api/push-tokens', { token, method:'POST', body:{ token:pushToken, platform:Device.osName || 'unknown' } });
      remoteRegistered = true;
    } catch (error) {
      console.warn('Expo push token is unavailable; local notifications remain enabled.', error.message);
    }
  }
  return true;
}

export async function notifySystem(title, body, data = {}) {
  if (!enabled || remoteRegistered) return;
  await Notifications.scheduleNotificationAsync({ content:{ title,body,data,sound:'default' }, trigger:null });
}

async function reminderMap() {
  try { return JSON.parse(await AsyncStorage.getItem(REMINDERS_KEY)) || {}; } catch { return {}; }
}

export async function scheduleBookingReminder(booking) {
  if (!enabled) return;
  const start = new Date(`${booking.date}T${booking.startTime}:00`);
  const triggerDate = new Date(start.getTime() - 15 * 60000);
  if (triggerDate <= new Date()) return;
  await cancelBookingReminder(booking.id);
  const identifier = await Notifications.scheduleNotificationAsync({
    content:{ title:'Sắp đến giờ sử dụng phòng', body:`${booking.roomName} bắt đầu lúc ${booking.startTime}.`, data:{ bookingId:booking.id }, sound:'default' },
    trigger:{ type:Notifications.SchedulableTriggerInputTypes.DATE, date:triggerDate, channelId:'bookings' }
  });
  const map = await reminderMap(); map[booking.id]=identifier;
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(map));
}

export async function cancelBookingReminder(bookingId) {
  const map = await reminderMap();
  if (map[bookingId]) await Notifications.cancelScheduledNotificationAsync(map[bookingId]).catch(()=>{});
  delete map[bookingId];
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(map));
}

export async function disableNotifications() {
  enabled = false;
  remoteRegistered = false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(REMINDERS_KEY);
}
