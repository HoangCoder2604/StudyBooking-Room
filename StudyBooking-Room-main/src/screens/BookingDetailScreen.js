import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBookings } from '../services/BookingContext';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';

export default function BookingDetailScreen({ route, navigation }) {
  const { booking } = route.params;
  const { cancelBooking } = useBookings();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const cancel = () => Alert.alert('Hủy booking', 'Bạn chắc chắn muốn hủy?', [
    { text:'Không' },
    { text:'Có', style:'destructive', onPress:async () => {
      try { await cancelBooking(booking.id); navigation.goBack(); }
      catch (error) { Alert.alert('Không thể hủy', error.message); }
    }}
  ]);
  return <View style={styles.container}>
    <Text style={styles.h1}>{booking.roomName}</Text>
    <Text style={[styles.status,{color:booking.status==='confirmed'?colors.success:booking.status==='cancelled'?colors.danger:colors.muted}]}>{booking.status.toUpperCase()}</Text>
    <View style={styles.card}>
      <Text style={styles.cardText}>📍 {booking.location}</Text><Text style={styles.cardText}>📅 {booking.date}</Text>
      <Text style={styles.cardText}>🕐 {booking.startTime} - {booking.endTime}</Text><Text style={styles.cardText}>🎯 {booking.purpose}</Text>
      <Text style={styles.cardText}>📝 {booking.note || 'Không có ghi chú'}</Text><Text style={styles.id}>{booking.id}</Text>
    </View>
    {booking.status === 'confirmed' && <Pressable style={styles.cancel} onPress={cancel}><Text style={styles.cancelText}>Hủy booking</Text></Pressable>}
  </View>;
}

const createStyles = (colors) => StyleSheet.create({container:{flex:1,backgroundColor:colors.background,padding:18},h1:{fontSize:28,fontWeight:'900',color:colors.text},status:{fontWeight:'900',marginTop:6},card:{backgroundColor:colors.card,padding:18,borderRadius:16,borderWidth:1,borderColor:colors.border,marginTop:18,gap:14},cardText:{color:colors.text},id:{color:colors.muted,fontSize:12},cancel:{marginTop:22,borderWidth:1,borderColor:colors.danger,padding:15,borderRadius:14,alignItems:'center'},cancelText:{color:colors.danger,fontWeight:'900'}});
