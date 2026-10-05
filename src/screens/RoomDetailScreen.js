import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useBookings } from '../services/BookingContext';

export default function RoomDetailScreen({ route, navigation }) {
  const { colors }=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { room:initialRoom, date, startTime, endTime } = route.params;
  const { rooms } = useBookings();
  const room = rooms.find((item) => item.id === initialRoom.id) || initialRoom;
  const available = room.available;
  return <ScrollView style={styles.screen} contentContainerStyle={{paddingBottom:30}}>
    <Image source={require('../../assets/study-room.png')} style={styles.image} />
    <View style={styles.body}>
      <View style={styles.row}><Text style={styles.h1}>{room.name}</Text><Text style={[styles.badge,{color:available?colors.success:colors.danger}]}>{available?'● Còn trống':'● Không khả dụng'}</Text></View>
      <Text style={styles.meta}>📍 {room.location}</Text>
      <View style={styles.infoCard}><Text style={styles.cardText}>👥 Sức chứa: {room.capacity} người</Text><Text style={styles.cardText}>📐 Kích cỡ: {room.size}</Text><Text style={styles.cardText}>🏢 Tầng: {room.floor}</Text></View>
      <Text style={styles.heading}>Tiện nghi</Text><Text style={styles.text}>{room.facilities.join(' • ')}</Text>
      <Text style={styles.heading}>Mô tả</Text><Text style={styles.text}>{room.description}</Text>
      <Text style={styles.heading}>Thời gian đã chọn</Text><View style={styles.infoCard}><Text style={styles.cardText}>{date}</Text><Text style={styles.cardText}>{startTime} - {endTime}</Text></View>
      <Pressable disabled={!available} onPress={()=>navigation.navigate('Booking',{room,date,startTime,endTime})} style={[styles.button,!available&&styles.disabled]}><Text style={[styles.buttonText,!available&&styles.disabledText]}>{available?'Đặt phòng này':'Không khả dụng'}</Text></Pressable>
    </View>
  </ScrollView>;
}
const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},image:{width:'100%',height:250},body:{padding:18},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},h1:{fontSize:28,fontWeight:'900',color:colors.text,flex:1},badge:{fontWeight:'800'},meta:{marginTop:8,color:colors.muted},infoCard:{backgroundColor:colors.card,padding:14,borderRadius:14,marginTop:14,gap:8,borderWidth:1,borderColor:colors.border},cardText:{color:colors.text},heading:{fontSize:17,fontWeight:'800',color:colors.text,marginTop:20,marginBottom:6},text:{color:colors.muted,lineHeight:22},button:{marginTop:24,backgroundColor:colors.primary,padding:16,borderRadius:14,alignItems:'center'},disabled:{backgroundColor:colors.disabled},buttonText:{color:colors.onPrimary,fontWeight:'900'},disabledText:{color:colors.onDisabled}});
