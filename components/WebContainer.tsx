import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

export default function WebContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.background}>
      <View style={styles.appContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    overflow: 'hidden',
  },
  appContainer: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: 'hidden',
  },
});
