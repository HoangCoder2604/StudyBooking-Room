import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import FilterChip from '../components/FilterChip';
import { initializeNotifications } from '../services/notifications';

export default function SettingsScreen() {
  const { colors }=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { token, user, updatePreferences } = useAuth();
  const toggleNotifications = async (value) => {
    if (value) await initializeNotifications({ token, notificationsEnabled:true });
    await updatePreferences({ notificationsEnabled:value });
  };
  return <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.flex}><Text style={styles.title}>Thông báo booking</Text><Text style={styles.sub}>Nhận trạng thái đặt và hủy phòng.</Text></View>
        <Switch value={user.notificationsEnabled} onValueChange={toggleNotifications} trackColor={{false:colors.disabled,true:colors.primary}} thumbColor={user.notificationsEnabled?colors.onPrimary:colors.card} />
      </View>
    </View>
    <Text style={styles.heading}>Giao diện</Text>
    <View style={styles.chips}>{[['light','Sáng'],['dark','Tối'],['system','Hệ thống']].map(([value,label]) =>
      <FilterChip key={value} label={label} selected={user.theme === value} onPress={() => updatePreferences({ theme:value })} />
    )}</View>
    <Text style={styles.note}>Tùy chọn được lưu theo tài khoản và áp dụng cho toàn bộ ứng dụng.</Text>
  </View>;
}

const createStyles=(colors)=>StyleSheet.create({container:{flex:1,backgroundColor:colors.background,padding:18},card:{backgroundColor:colors.card,borderRadius:16,borderWidth:1,borderColor:colors.border,padding:16},row:{flexDirection:'row',alignItems:'center'},flex:{flex:1},title:{fontSize:16,fontWeight:'900',color:colors.text},sub:{color:colors.muted,marginTop:4},heading:{fontWeight:'900',fontSize:18,color:colors.text,marginTop:24,marginBottom:12},chips:{flexDirection:'row',gap:8,flexWrap:'wrap'},note:{color:colors.muted,lineHeight:20,marginTop:16}});
