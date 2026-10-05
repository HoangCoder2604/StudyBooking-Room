import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';

export default function RoomCard({ room, available, onPress, onBook }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const statusLabel = room.availabilityStatus === 'maintenance' ? 'Bảo trì' : available ? 'Còn trống' : 'Đã đặt';
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={require('../../assets/study-room.png')} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{room.name}</Text>
          <View style={[styles.badge, { backgroundColor: available ? colors.successSurface : colors.dangerSurface }]}>
            <Text style={{ color: available ? colors.success : colors.danger, fontWeight: '700', fontSize: 12 }}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>📍 {room.location}</Text>
        <Text style={styles.meta}>👥 {room.capacity} people · 📐 {room.size}</Text>
        <Text style={styles.facilities} numberOfLines={1}>{room.facilities.join(' • ')}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.secondaryBtn} onPress={onPress}><Text style={styles.secondaryText}>Chi tiết</Text></Pressable>
          <Pressable disabled={!available} style={[styles.primaryBtn, !available && styles.disabled]} onPress={onBook}>
            <Text style={[styles.primaryText,!available&&styles.disabledText]}>Đặt phòng</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  image: { width: '100%', height: 170 },
  body: { padding: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  meta: { color: colors.muted, marginTop: 8 },
  facilities: { color: colors.primaryDark, marginTop: 8, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  secondaryText: { color: colors.primary, fontWeight: '700' },
  primaryBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  primaryText: { color: colors.onPrimary, fontWeight: '800' },
  disabledText: { color: colors.onDisabled },
  disabled: { backgroundColor: colors.disabled }
});
