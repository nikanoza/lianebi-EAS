import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <--- The Fix
import { Colors, Shadow, BorderRadius, Typography } from '@/constants/theme';

export default function GlobalLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets(); // <--- Get safe area dimensions

  return (
    <View
      style={[
        styles.container,
        {
          // Dynamic positioning based on the device's notch
          top: insets.top + 10,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => setLanguage('ka')}
        style={[styles.button, language === 'ka' && styles.activeButton]}
      >
        <Text style={[styles.text, language === 'ka' && styles.activeText]}>
          🇬🇪
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setLanguage('en')}
        style={[styles.button, language === 'en' && styles.activeButton]}
      >
        <Text style={[styles.text, language === 'en' && styles.activeText]}>
          🇺🇸
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Keeps it floating
    right: 20, // Distance from right edge
    zIndex: 9999, // Stays on top

    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    padding: 4,
    ...Shadow.medium,
    borderWidth: 1,
    borderColor: Colors.gray?.[200] || '#e5e7eb',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  activeButton: {
    backgroundColor: Colors.gray?.[100] || '#f3f4f6',
  },
  text: {
    fontSize: Typography.sizes.lg,
    opacity: 0.5,
  },
  activeText: {
    opacity: 1,
    fontWeight: 'bold',
  },
});
