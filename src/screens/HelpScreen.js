import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../services/ThemeContext';

export default function HelpScreen() {
  const styles = useThemedStyles(createStyles);
  const faqs = [['Làm sao tìm phòng phù hợp?','Chọn ngày, giờ sử dụng và các tiêu chí bạn cần. Danh sách phòng phù hợp sẽ được hiển thị ngay bên dưới.'],['Nếu phòng vừa được người khác đặt?','Bạn sẽ nhận được thông báo và có thể chọn một phòng hoặc khung giờ khác.'],['Khi nào phòng có thể được đặt lại?','Ngay sau khi thời gian sử dụng kết thúc, phòng sẽ được mở lại cho các lượt đặt tiếp theo.'],['Làm sao nhận thông báo?','Bật Thông báo trong phần Cài đặt và cho phép điện thoại hiển thị thông báo.']];
  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}><Text style={styles.h1}>Câu hỏi thường gặp</Text>{faqs.map(([question,answer]) => <View key={question} style={styles.card}><Text style={styles.q}>{question}</Text><Text style={styles.a}>{answer}</Text></View>)}<Pressable style={styles.button} onPress={() => Linking.openURL('mailto:support@studyroom.local?subject=StudyRoom%20Support')}><Text style={styles.buttonText}>Gửi email hỗ trợ</Text></Pressable></ScrollView>;
}

const createStyles = (colors) => StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:18},h1:{fontSize:26,fontWeight:'900',color:colors.text,marginBottom:14},card:{backgroundColor:colors.card,borderRadius:15,padding:16,borderWidth:1,borderColor:colors.border,marginBottom:12},q:{fontWeight:'900',color:colors.text},a:{color:colors.muted,lineHeight:21,marginTop:7},button:{backgroundColor:colors.primary,borderRadius:14,padding:15,alignItems:'center',marginTop:10},buttonText:{color:colors.onPrimary,fontWeight:'900'}});
