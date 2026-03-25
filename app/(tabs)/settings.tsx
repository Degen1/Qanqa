import SegmentedControl from '@react-native-segmented-control/segmented-control';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemePreference, useThemePreference } from '@/contexts/theme-preference-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const THEME_OPTIONS: ThemePreference[] = ['light', 'system', 'dark'];
const THEME_LABELS = ['ብርሃን', 'ተቀያሪ', 'ጸልማት'];

export default function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const selectedIndex = THEME_OPTIONS.indexOf(preference);

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>ልጪ</Text>
        

        <SegmentedControl
          values={THEME_LABELS}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : 1}
          onChange={(event) => {
            const nextPreference = THEME_OPTIONS[event.nativeEvent.selectedSegmentIndex] ?? 'system';
            setPreference(nextPreference);
          }}
          style={styles.segmented}
          tintColor={isDark ? '#334155' : '#e5e7eb'}
          fontStyle={{ color: isDark ? '#e2e8f0' : '#1f2937' }}
          activeFontStyle={{ color: isDark ? '#ffffff' : '#111827', fontWeight: '700' }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  card: {
    borderRadius: 12,
    //borderWidth: 1,
    padding: 16,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  cardDark: {
    //backgroundColor: '#0b1220',
   // borderColor: '#1e293b',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 14,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  segmented: {
    height: 46,
  },
});
