import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';

export default function ProfileScreen({ navigation }) {
  const {colors}=useAppTheme(); const styles=useThemedStyles(createStyles);
  const { user, logout } = useAuth();
  const initials = user.name.split(/\s+/).slice(-2).map(part=>part[0]).join('').toUpperCase();
  const menu=[
    ['🔔','Thông báo','Notifications'],
    ['⚙️','Cài đặt & giao diện','Settings'],
    ['❓','Trợ giúp','Help'],
    ['ℹ️','Giới thiệu StudyRoom','About']
  ];
  const confirmLogout=()=>Alert.alert('Đăng xuất','Bạn muốn đăng xuất khỏi tài khoản?', [{text:'Hủy'},{text:'Đăng xuất',style:'destructive',onPress:logout}]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
    <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
    <Text style={styles.name}>{user.name}</Text><Text style={styles.role}>{user.role === 'student' ? 'Sinh viên' : user.role}</Text>
    <View style={styles.info}><Text style={styles.item}>🎓 {user.studentId}</Text><Text style={styles.item}>✉️ {user.email}</Text></View>
    <View style={styles.card}>{menu.map(([icon,label,route])=><Pressable key={route} style={styles.menu} onPress={()=>navigation.navigate(route)}><Text style={styles.menuText}>{icon}  {label}</Text><Text style={styles.chevron}>›</Text></Pressable>)}</View>
    <Pressable style={styles.logout} onPress={confirmLogout}><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
  </ScrollView>;
}
const createStyles=(colors)=>StyleSheet.create({screen:{flex:1,backgroundColor:colors.background},container:{padding:24,alignItems:'center'},avatar:{width:96,height:96,borderRadius:48,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:20},avatarText:{color:colors.onPrimary,fontSize:30,fontWeight:'900'},name:{fontSize:24,fontWeight:'900',color:colors.text,marginTop:14},role:{color:colors.muted,marginTop:4},info:{width:'100%',backgroundColor:colors.card,borderRadius:16,borderWidth:1,borderColor:colors.border,padding:16,marginTop:22,gap:13},item:{color:colors.text,fontWeight:'600'},card:{width:'100%',backgroundColor:colors.card,borderRadius:16,borderWidth:1,borderColor:colors.border,marginTop:14,overflow:'hidden'},menu:{flexDirection:'row',alignItems:'center',padding:17,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.border},menuText:{flex:1,color:colors.text,fontWeight:'700'},chevron:{fontSize:24,color:colors.muted},logout:{width:'100%',borderWidth:1,borderColor:colors.danger,borderRadius:14,padding:14,alignItems:'center',marginTop:20},logoutText:{color:colors.danger,fontWeight:'900'}});
