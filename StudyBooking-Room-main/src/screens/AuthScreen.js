import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useAppTheme, useThemedStyles } from '../services/ThemeContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register({ name: name.trim(), studentId: studentId.trim(), email: email.trim(), password });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logo}><Text style={styles.logoText}>SR</Text></View>
      <Text style={styles.title}>StudyRoom</Text>
      <Text style={styles.subtitle}>{mode === 'login' ? 'Đăng nhập để đặt phòng học' : 'Tạo tài khoản sinh viên'}</Text>
      <View style={styles.card}>
        {mode === 'register' && <>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Nguyễn Văn A" placeholderTextColor={colors.muted} style={styles.input} />
          <Text style={styles.label}>Mã sinh viên</Text>
          <TextInput value={studentId} onChangeText={setStudentId} placeholder="23IT.B000" placeholderTextColor={colors.muted} autoCapitalize="characters" style={styles.input} />
        </>}
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="student@example.com" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="Tối thiểu 6 ký tự" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={submit}>
          {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Text>}
        </Pressable>
        <Pressable onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          <Text style={styles.switch}>{mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const createStyles = (colors) => StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},container:{flexGrow:1,justifyContent:'center',padding:24},
  logo:{width:72,height:72,borderRadius:22,backgroundColor:colors.primary,alignSelf:'center',alignItems:'center',justifyContent:'center'},logoText:{color:colors.onPrimary,fontSize:26,fontWeight:'900'},
  title:{fontSize:32,fontWeight:'900',color:colors.text,textAlign:'center',marginTop:14},subtitle:{color:colors.muted,textAlign:'center',marginTop:6,marginBottom:22},
  card:{backgroundColor:colors.card,padding:20,borderRadius:20,borderWidth:1,borderColor:colors.border},label:{fontWeight:'800',color:colors.text,marginBottom:7,marginTop:10},
  input:{height:50,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:14,backgroundColor:colors.input,color:colors.text},error:{color:colors.danger,marginTop:14,lineHeight:20},
  button:{height:52,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:20},disabled:{opacity:.65},buttonText:{color:colors.onPrimary,fontWeight:'900'},
  switch:{color:colors.primary,fontWeight:'800',textAlign:'center',marginTop:18}
});
