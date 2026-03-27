import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';

export default function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.inner}>
        <Text style={s.logo}>CheapAkiya</Text>
        <Text style={s.title}>Japanese homes, in English.</Text>
        <Text style={s.subtitle}>
          Browse curated akiya listings, save favorites, and unlock member features when you verify your email.
        </Text>

        <TouchableOpacity style={s.primaryBtn} onPress={onContinue}>
          <Text style={s.primaryBtnText}>Browse listings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.secondaryBtn} onPress={() => Linking.openURL('https://cheapakiya.com/join')}>
          <Text style={s.secondaryBtnText}>Join free on CheapAkiya</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { color: '#e85d2f', fontSize: 30, fontWeight: '900', marginBottom: 12 },
  title: { color: '#fff', fontSize: 34, fontWeight: '900', lineHeight: 40, marginBottom: 12 },
  subtitle: { color: '#9ca3af', fontSize: 16, lineHeight: 24, marginBottom: 28 },
  primaryBtn: { backgroundColor: '#e85d2f', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
