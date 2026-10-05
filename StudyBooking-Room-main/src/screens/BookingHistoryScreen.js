import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useBookings } from '../services/BookingContext';
import FilterChip from '../components/FilterChip';

export default function BookingHistoryScreen({navigation}){
  const {colors}=useAppTheme(); const styles=useThemedStyles(createStyles);
  const {bookings,refreshBookings}=useBookings(); const [filter,setFilter]=useState('All');
  useFocusEffect(useCallback(()=>{refreshBookings().catch(()=>{});},[refreshBookings]));
  const shown=bookings.filter(b=>filter==='All'||b.status===filter.toLowerCase());
  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}><Text style={styles.h1}>My Bookings</Text><View style={styles.chips}>{['All','Confirmed','Completed','Cancelled'].map(x=><FilterChip key={x} label={x} selected={filter===x} onPress={()=>setFilter(x)}/>)}</View>{shown.map(b=><Pressable key={b.id} style={styles.card} onPress={()=>navigation.navigate('BookingDetail',{booking:b})}><View style={styles.row}><Text style={styles.room}>{b.roomName}</Text><Text style={[styles.status,{color:b.status==='confirmed'?colors.success:b.status==='cancelled'?colors.danger:colors.muted}]}>{b.status.toUpperCase()}</Text></View><Text style={styles.meta}>📍 {b.location}</Text><Text style={styles.meta}>📅 {b.date} · 🕐 {b.startTime} - {b.endTime}</Text></Pressable>)}</ScrollView>;
}
const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18,paddingBottom:30},h1:{fontSize:28,fontWeight:'900',color:colors.text,marginBottom:14},chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16},card:{backgroundColor:colors.card,padding:16,borderRadius:16,borderWidth:1,borderColor:colors.border,marginBottom:12},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},room:{fontWeight:'900',fontSize:18,color:colors.text,flex:1},status:{fontSize:11,fontWeight:'900'},meta:{color:colors.muted,marginTop:8}});
