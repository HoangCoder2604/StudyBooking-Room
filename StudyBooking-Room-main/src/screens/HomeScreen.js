import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useBookings } from '../services/BookingContext';
import { toDateKey, toTimeKey } from '../utils/dateTime';
import RoomCard from '../components/RoomCard';
import FilterChip from '../components/FilterChip';
import SlotPicker from '../components/SlotPicker';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';

function initialDate() { const value = new Date(); value.setDate(value.getDate() + 1); return value; }
function initialTime(hour) { const value = new Date(); value.setHours(hour, 0, 0, 0); return value; }

export default function HomeScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { rooms, loading, error, searchRooms } = useBookings();
  const isFocused = useIsFocused();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(initialDate);
  const [start, setStart] = useState(() => initialTime(8));
  const [end, setEnd] = useState(() => initialTime(10));
  const [size, setSize] = useState('All');
  const slot = useMemo(() => ({ date:toDateKey(date), startTime:toTimeKey(start), endTime:toTimeKey(end) }), [date,start,end]);
  const valid = slot.startTime < slot.endTime;

  useEffect(() => {
    if (!valid || !isFocused) return;
    const timer = setTimeout(() => searchRooms({ ...slot, q:query, size }).catch(() => {}), 250);
    return () => clearTimeout(timer);
  }, [query,size,slot.date,slot.startTime,slot.endTime,valid,isFocused,searchRooms]);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>STUDYROOM</Text>
    <Text style={styles.h1}>Tìm phòng học</Text>
    <TextInput placeholder="Tên phòng hoặc vị trí..." placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.search} />
    <SlotPicker date={date} start={start} end={end} onDateChange={setDate} onStartChange={setStart} onEndChange={setEnd} />
    <Text style={styles.sectionTitle}>Kích cỡ</Text>
    <View style={styles.chips}>{['All','Small','Medium','Large'].map(value=><FilterChip key={value} label={value} selected={size===value} onPress={()=>setSize(value)}/>)}</View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Phòng theo khung giờ</Text><Text style={styles.count}>{rooms.length} kết quả</Text></View>
    {loading && <ActivityIndicator color={colors.primary} style={styles.loader}/>} 
    {!!error && <Text style={styles.error}>{error}</Text>}
    {!loading && valid && rooms.map(room => {
      const params={room,date:slot.date,startTime:slot.startTime,endTime:slot.endTime};
      return <RoomCard key={room.id} room={room} available={room.available} onPress={()=>navigation.navigate('RoomDetail',params)} onBook={()=>navigation.navigate('Booking',params)}/>;
    })}
  </ScrollView>;
}

const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18,paddingBottom:30},eyebrow:{color:colors.primary,fontWeight:'800',letterSpacing:1.2,marginTop:6},h1:{fontSize:30,fontWeight:'900',color:colors.text,marginTop:4,marginBottom:16},search:{backgroundColor:colors.input,color:colors.text,borderRadius:14,paddingHorizontal:14,height:50,borderWidth:1,borderColor:colors.border},sectionTitle:{fontSize:18,fontWeight:'800',color:colors.text,marginTop:20,marginBottom:10},chips:{flexDirection:'row',flexWrap:'wrap',gap:8},sectionHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},count:{marginTop:12,color:colors.muted},loader:{marginVertical:24},error:{color:colors.danger,backgroundColor:colors.card,padding:12,borderRadius:10,marginBottom:12}});
