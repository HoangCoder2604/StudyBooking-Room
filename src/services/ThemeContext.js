import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

const light = {
  primary:'#315EFB',primaryDark:'#2446BE',onPrimary:'#FFFFFF',onDisabled:'#FFFFFF',background:'#F4F7FB',card:'#FFFFFF',text:'#18212F',muted:'#667386',border:'#DCE3ED',success:'#168552',danger:'#C93F4A',warning:'#B96B08',chip:'#EEF3FF',disabled:'#AAB2C0',input:'#FFFFFF',soft:'#EEF3FF',successSurface:'#E8F7EF',dangerSurface:'#FDECEC',warningSurface:'#FFF5DF'
};
const dark = {
  primary:'#8EA2FF',primaryDark:'#B8C4FF',onPrimary:'#0B1220',onDisabled:'#F8FAFC',background:'#0F172A',card:'#172033',text:'#F8FAFC',muted:'#B5C0D0',border:'#33445F',success:'#54D695',danger:'#FF8585',warning:'#FACC5C',chip:'#243452',disabled:'#526078',input:'#101A2D',soft:'#243452',successSurface:'#153C31',dangerSurface:'#43252B',warningSurface:'#44351C'
};

const ThemeContext = createContext({ colors:light, dark:false });

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const system = useColorScheme();
  const isDark = user ? user.theme === 'dark' || (user.theme === 'system' && system === 'dark') : system === 'dark';
  const value = useMemo(() => ({ colors:isDark ? dark : light, dark:isDark }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => useContext(ThemeContext);
export const useThemedStyles = (factory) => {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
};
export { light as lightColors, dark as darkColors };
