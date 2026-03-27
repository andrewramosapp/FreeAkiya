import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaceholderScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: '#9ca3af', fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
});
