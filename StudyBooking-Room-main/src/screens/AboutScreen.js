import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../services/ThemeContext';

export default function AboutScreen() {
  const styles = useThemedStyles(createStyles);
  const features = [['Nhanh chóng','Tìm phòng phù hợp chỉ trong vài bước.'],['Chủ động','Chọn ngày, giờ và quản lý lịch đặt dễ dàng.'],['An tâm','Tình trạng phòng luôn được kiểm tra trước khi xác nhận.']];
  return <View style={styles.container}><View style={styles.logo}><Text style={styles.logoText}>SR</Text></View><Text style={styles.h1}>StudyRoom Booking</Text><Text style={styles.tagline}>Không gian học tập thuận tiện hơn mỗi ngày.</Text><Text style={styles.body}>StudyRoom giúp sinh viên nhanh chóng tìm phòng phù hợp, chủ động chọn thời gian và quản lý các lịch đặt của mình ở bất kỳ đâu.</Text><View style={styles.features}>{features.map(([title,copy])=><View style={styles.feature} key={title}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureCopy}>{copy}</Text></View>)}</View></View>;
}

const createStyles = (colors) => StyleSheet.create({container:{flex:1,backgroundColor:colors.background,alignItems:'center',padding:28},logo:{width:84,height:84,borderRadius:24,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:28},logoText:{fontSize:30,fontWeight:'900',color:colors.onPrimary},h1:{fontSize:25,fontWeight:'900',color:colors.text,marginTop:18},tagline:{color:colors.primaryDark,fontWeight:'700',marginTop:7,textAlign:'center'},body:{color:colors.muted,textAlign:'center',lineHeight:22,marginTop:22},features:{width:'100%',marginTop:24,gap:10},feature:{backgroundColor:colors.card,borderColor:colors.border,borderWidth:1,borderRadius:14,padding:15},featureTitle:{color:colors.text,fontWeight:'900'},featureCopy:{color:colors.muted,marginTop:5,lineHeight:20}});
