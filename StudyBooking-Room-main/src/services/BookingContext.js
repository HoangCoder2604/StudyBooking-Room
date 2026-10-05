import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_URL, apiRequest, queryString } from './api';
import { cancelBookingReminder, disableNotifications, initializeNotifications, notifySystem, scheduleBookingReminder } from './notifications';

const BookingContext = createContext(null);
export function BookingProvider({ children }) {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const lastFilters = useRef(null);

  const searchRooms = useCallback(async (filters = {}) => {
    if (!token) return [];
    lastFilters.current = filters;
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/api/rooms${queryString(filters)}`, { token });
      setRooms(data.rooms);
      return data.rooms;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshBookings = useCallback(async () => {
    if (!token) return [];
    try {
      const data = await apiRequest('/api/bookings', { token });
      setBookings(data.bookings);
      return data.bookings;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [token]);

  useEffect(() => {
    if (token) refreshBookings().catch(() => {});
    else { setRooms([]); setBookings([]); }
  }, [token, refreshBookings]);

  useEffect(() => {
    if (!token || !user) return;
    if (user.notificationsEnabled) {
      initializeNotifications({ token, notificationsEnabled:true }).then(async (allowed) => {
        if (!allowed) return;
        const current = await refreshBookings();
        await Promise.all(current.filter(item => item.status === 'confirmed').map(scheduleBookingReminder));
      }).catch(()=>{});
    } else disableNotifications().catch(()=>{});

    const socketUrl = `${API_URL.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`;
    let socket;
    let reconnectTimer;
    let stopped = false;
    const connect = () => {
      socket = new WebSocket(socketUrl);
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type === 'rooms_updated' && lastFilters.current) searchRooms(lastFilters.current).catch(()=>{});
          if (typeof event.type === 'string' && event.type.startsWith('booking_')) {
            setRevision((value) => value + 1);
            refreshBookings().catch(()=>{});
            if (event.bookingId && event.type === 'booking_cancelled') cancelBookingReminder(event.bookingId).catch(()=>{});
            if (event.title && event.message) notifySystem(event.title, event.message, event).catch(()=>{});
          }
        } catch {}
      };
      socket.onclose = () => {
        if (!stopped) reconnectTimer = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token, user?.notificationsEnabled, searchRooms, refreshBookings]);

  const createBooking = useCallback(async ({ room, date, startTime, endTime, purpose, note }) => {
    try {
      const data = await apiRequest('/api/bookings', { token, method: 'POST', body: { roomId: room.id, date, startTime, endTime, purpose, note } });
      setBookings((current) => [data.booking, ...current.filter(item => item.id !== data.booking.id)]);
      scheduleBookingReminder(data.booking).catch(()=>{});
      return { ok: true, booking: data.booking };
    } catch (e) {
      return { ok: false, code: e.status, conflict: e.code === 'BOOKING_CONFLICT', message: e.message };
    }
  }, [token]);

  const cancelBooking = useCallback(async (bookingId) => {
    await apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, { token, method: 'PATCH' });
    await cancelBookingReminder(bookingId).catch(()=>{});
    setBookings((current) => current.map((item) => item.id === bookingId ? { ...item, status: 'cancelled' } : item));
  }, [token]);

  const value = useMemo(() => ({ rooms, bookings, loading, error, revision, searchRooms, refreshBookings, createBooking, cancelBooking }), [rooms, bookings, loading, error, revision, searchRooms, refreshBookings, createBooking, cancelBooking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export const useBookings = () => useContext(BookingContext);
