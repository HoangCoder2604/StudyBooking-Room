import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import FilterChip from '../components/FilterChip';
import RoomCard from '../components/RoomCard';
import SlotPicker from '../components/SlotPicker';
import { useBookings } from '../services/BookingContext';
import { toDateKey, toTimeKey } from '../utils/dateTime';

function dateTomorrow(){const d=new Date();d.setDate(d.getDate()+1);return d}
function at(hour){const d=new Date();d.setHours(hour,0,0,0);return d}
const buildings=['All','Building A','Building B','Building C','Central Library','Innovation Center'];
const facilities=['All','Projector','WiFi','Whiteboard','Smart TV','Computer','Air Conditioner'];

export default function SearchScreen({ navigation }) {
  const { colors }=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { rooms,loading,error,searchRooms }=useBookings();
  const isFocused=useIsFocused();
  const [q,setQ]=useState(''); const [size,setSize]=useState('All'); const [building,setBuilding]=useState('All');
  const [status,setStatus]=useState('All'); const [facility,setFacility]=useState('All'); const [capacity,setCapacity]=useState('');
  const [date,setDate]=useState(dateTomorrow); const [start,setStart]=useState(()=>at(8)); const [end,setEnd]=useState(()=>at(10));
  const slot=useMemo(()=>({date:toDateKey(date),startTime:toTimeKey(start),endTime:toTimeKey(end)}),[date,start,end]);
  const valid=slot.startTime<slot.endTime;

  useEffect(()=>{if(!valid||!isFocused)return;const timer=setTimeout(()=>searchRooms({...slot,q,size,building,status,facility,minCapacity:capacity||0}).catch(()=>{}),300);return()=>clearTimeout(timer)},[q,size,building,status,facility,capacity,slot.date,slot.startTime,slot.endTime,valid,isFocused,searchRooms]);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.h1}>Tìm kiếm nâng cao</Text>
    <TextInput value={q} onChangeText={setQ} placeholder="Tên phòng hoặc vị trí" placeholderTextColor={colors.muted} style={styles.input}/>
    <SlotPicker date={date} start={start} end={end} onDateChange={setDate} onStartChange={setStart} onEndChange={setEnd}/>
    <Text style={styles.label}>Kích cỡ</Text><View style={styles.chips}>{['All','Small','Medium','Large'].map(v=><FilterChip key={v} label={v} selected={size===v} onPress={()=>setSize(v)}/>)}</View>
    <Text style={styles.label}>Trạng thái</Text><View style={styles.chips}>{[['All','Tất cả'],['available','Còn trống'],['booked','Đã đặt'],['maintenance','Bảo trì']].map(([v,label])=><FilterChip key={v} label={label} selected={status===v} onPress={()=>setStatus(v)}/>)}</View>
    <Text style={styles.label}>Vị trí</Text><View style={styles.chips}>{buildings.map(v=><FilterChip key={v} label={v} selected={building===v} onPress={()=>setBuilding(v)}/>)}</View>
    <Text style={styles.label}>Tiện nghi</Text><View style={styles.chips}>{facilities.map(v=><FilterChip key={v} label={v} selected={facility===v} onPress={()=>setFacility(v)}/>)}</View>
    <Text style={styles.label}>Sức chứa tối thiểu</Text><TextInput value={capacity} onChangeText={value=>setCapacity(value.replace(/[^0-9]/g,''))} placeholder="Ví dụ: 10" placeholderTextColor={colors.muted} keyboardType="number-pad" style={styles.input}/>
    <Text style={styles.info}>{rooms.length} phòng · {slot.date} · {slot.startTime}-{slot.endTime}</Text>
    {loading&&<ActivityIndicator color={colors.primary} style={{marginBottom:18}}/>}{!!error&&<Text style={styles.error}>{error}</Text>}
    {!loading&&valid&&rooms.map(room=>{const params={room,date:slot.date,startTime:slot.startTime,endTime:slot.endTime};return <RoomCard key={room.id} room={room} available={room.available} onPress={()=>navigation.navigate('RoomDetail',params)} onBook={()=>navigation.navigate('Booking',params)}/>})}
  </ScrollView>;
}

const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18,paddingBottom:30},h1:{fontSize:28,fontWeight:'900',color:colors.text,marginBottom:14},input:{height:50,color:colors.text,backgroundColor:colors.input,borderRadius:14,borderWidth:1,borderColor:colors.border,paddingHorizontal:14},label:{fontWeight:'800',color:colors.text,marginTop:18,marginBottom:8},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},info:{color:colors.muted,marginVertical:18,fontWeight:'600'},error:{color:colors.danger,backgroundColor:colors.card,padding:12,borderRadius:10,marginBottom:12}});
