import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemedStyles } from '../services/ThemeContext';
import { toDateKey, toTimeKey } from '../utils/dateTime';

export default function SlotPicker({ date, start, end, onDateChange, onStartChange, onEndChange }) {
  const styles = useThemedStyles(createStyles);
  const [picker, setPicker] = useState(null);
  const invalid = toTimeKey(start) >= toTimeKey(end);
  const value = picker === 'date' ? date : picker === 'start' ? start : end;
  const change = (event, next) => {
    if (Platform.OS !== 'ios') setPicker(null);
    if (!next) return;
    if (picker === 'date') onDateChange(next);
    else if (picker === 'start') onStartChange(next);
    else onEndChange(next);
  };

  return <>
    <View style={styles.row}>
      <Pressable style={styles.box} onPress={() => setPicker('date')}><Text style={styles.label}>Ngày</Text><Text style={styles.value}>{toDateKey(date)}</Text></Pressable>
      <Pressable style={styles.box} onPress={() => setPicker('start')}><Text style={styles.label}>Từ</Text><Text style={styles.value}>{toTimeKey(start)}</Text></Pressable>
      <Pressable style={styles.box} onPress={() => setPicker('end')}><Text style={styles.label}>Đến</Text><Text style={styles.value}>{toTimeKey(end)}</Text></Pressable>
    </View>
    {picker && <DateTimePicker value={value} mode={picker === 'date' ? 'date' : 'time'} minimumDate={picker === 'date' ? new Date() : undefined} is24Hour onChange={change} />}
    {invalid && <Text style={styles.error}>Giờ kết thúc phải sau giờ bắt đầu.</Text>}
  </>;
}

const createStyles=(colors)=>StyleSheet.create({row:{flexDirection:'row',gap:8,marginTop:12},box:{flex:1,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:12,padding:10},label:{color:colors.muted,fontSize:12},value:{color:colors.text,fontWeight:'800',marginTop:3,fontSize:12},error:{color:colors.danger,fontWeight:'700',marginTop:9}});
