import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemedStyles } from '../services/ThemeContext';

export default function FilterChip({ label, selected, onPress }) {
  const styles = useThemedStyles(createStyles);
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}><Text style={[styles.text, selected && styles.selectedText]}>{label}</Text></Pressable>;
}

const createStyles = (colors) => StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontWeight: '600' },
  selectedText: { color: colors.onPrimary, fontWeight:'800' }
});
