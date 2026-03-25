import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      backgroundColor={isDark ? '#0f172a' : '#ffffff'}
      tintColor={isDark ? '#f8fafc' : '#111827'}
      iconColor={{ default: isDark ? '#94a3b8' : '#667085', selected: isDark ? '#f8fafc' : '#111827' }}
      labelStyle={{
        default: { color: isDark ? '#94a3b8' : '#667085', fontSize: 12 },
        selected: { color: isDark ? '#f8fafc' : '#111827', fontSize: 12, fontWeight: '700' },
      }}>
          <NativeTabs.Trigger name="index">
            <Label>ናተይ</Label>
            <Icon sf={"play.square.fill"}
            selectedColor={isDark ? '#f8fafc' : '#111827'}
            drawable="ic_menu_mylocation" />
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="translate">
            <Label>ትርጉም</Label>
            <Icon sf={"globe"}
            selectedColor={isDark ? '#f8fafc' : '#111827'}
            drawable="ic_menu_manage" />
          </NativeTabs.Trigger>
          

          <NativeTabs.Trigger name="dictionary">
            <Label>መዝገብ</Label>
            <Icon sf={"book.closed.fill"}
            selectedColor={isDark ? '#f8fafc' : '#111827'}
            drawable="ic_menu_manage" />
          </NativeTabs.Trigger>


           <NativeTabs.Trigger name="settings">
            <Label>መማረጺ</Label>
            <Icon sf={"gearshape.fill"}
            selectedColor={isDark ? '#f8fafc' : '#111827'}
            drawable="ic_menu_manage" />
          </NativeTabs.Trigger>
    

          
    </NativeTabs>
  );
}
