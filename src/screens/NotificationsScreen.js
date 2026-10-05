import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import { apiRequest } from '../services/api';
import { useBookings } from '../services/BookingContext';

export default function NotificationsScreen() {
  const {colors}=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { token, user } = useAuth();
  const { revision } = useBookings();
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  useFocusEffect(useCallback(()=>{let active=true; setLoading(true); apiRequest('/api/notifications',{token}).then(d=>active&&setItems(d.notifications)).finally(()=>active&&setLoading(false)); return()=>{active=false};},[token,revision]));
  if (!user.notificationsEnabled) return <View style={styles.center}><Text style={styles.icon}>🔕</Text><Text style={styles.title}>Thông báo đang tắt</Text><Text style={styles.sub}>Bạn có thể bật lại trong phần Cài đặt.</Text></View>;
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary}/></View>;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}>{items.length===0?<Text style={styles.empty}>Chưa có thông báo.</Text>:items.map(item=><View key={item.id} style={styles.card}><Text style={styles.title}>{item.title}</Text><Text style={styles.sub}>{item.message}</Text></View>)}</ScrollView>;
}
const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18},center:{flex:1,backgroundColor:colors.background,alignItems:'center',justifyContent:'center',padding:30},icon:{fontSize:42},title:{fontWeight:'900',fontSize:17,color:colors.text,marginTop:8},sub:{color:colors.muted,marginTop:5,lineHeight:20},card:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:15,padding:16,marginBottom:12},empty:{color:colors.muted,textAlign:'center',marginTop:50}});
