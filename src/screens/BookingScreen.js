import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useBookings } from '../services/BookingContext';

export default function BookingScreen({ route, navigation }) {
  const { colors }=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { room, date, startTime, endTime } = route.params;
  const { createBooking } = useBookings();
  const [purpose, setPurpose] = useState('Học nhóm');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!purpose.trim()) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục đích đặt phòng.');
    setBusy(true);
    const result = await createBooking({ room, date, startTime, endTime, purpose, note });
    setBusy(false);
    if (!result.ok) {
      Alert.alert(result.conflict ? 'Phòng vừa được người khác đặt' : 'Không thể đặt phòng', result.message, result.conflict ? [{text:'Chọn phòng khác',onPress:()=>navigation.popToTop()}] : undefined);
      return;
    }
    navigation.replace('BookingSuccess', { booking: result.booking });
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
    <Text style={styles.h1}>Xác nhận đặt phòng</Text>
    <View style={styles.card}>
      <Text style={styles.room}>{room.name}</Text><Text style={styles.meta}>📍 {room.location}</Text>
      <Text style={styles.item}>📅 {date}</Text><Text style={styles.item}>🕐 {startTime} - {endTime}</Text><Text style={styles.item}>👥 Sức chứa: {room.capacity} người</Text>
    </View>
    <Text style={styles.label}>Mục đích sử dụng</Text><TextInput value={purpose} onChangeText={setPurpose} style={styles.input} />
    <Text style={styles.label}>Ghi chú</Text><TextInput value={note} onChangeText={setNote} placeholder="Thông tin bổ sung..." placeholderTextColor={colors.muted} multiline style={[styles.input,{height:110,textAlignVertical:'top',paddingTop:14}]} />
    <View style={styles.warning}><Text style={styles.warningText}>Tình trạng phòng sẽ được kiểm tra lại trước khi hoàn tất. Nếu phòng vừa có người đặt, bạn có thể chọn phòng hoặc khung giờ khác.</Text></View>
    <Pressable disabled={busy} style={[styles.button,busy&&styles.disabled]} onPress={confirm}>{busy?<ActivityIndicator color={colors.onPrimary}/>:<Text style={styles.buttonText}>Xác nhận đặt phòng</Text>}</Pressable>
  </ScrollView>;
}
const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18},h1:{fontSize:26,fontWeight:'900',color:colors.text,marginBottom:14},card:{backgroundColor:colors.card,padding:16,borderRadius:16,borderWidth:1,borderColor:colors.border},room:{fontSize:20,fontWeight:'900',color:colors.text},meta:{color:colors.muted,marginTop:6},item:{marginTop:10,color:colors.text},label:{marginTop:18,marginBottom:8,fontWeight:'800',color:colors.text},input:{backgroundColor:colors.input,color:colors.text,borderWidth:1,borderColor:colors.border,borderRadius:14,height:50,paddingHorizontal:14},warning:{marginTop:18,backgroundColor:colors.warningSurface,padding:14,borderRadius:14,borderWidth:1,borderColor:colors.warning},warningText:{color:colors.warning,lineHeight:20},button:{marginTop:22,backgroundColor:colors.primary,padding:16,borderRadius:14,alignItems:'center'},disabled:{opacity:.65},buttonText:{color:colors.onPrimary,fontWeight:'900'}});
