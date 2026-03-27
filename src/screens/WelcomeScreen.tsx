import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function WelcomeScreen({
  onBrowse,
  onSignUp,
  onSignIn,
  onPremium,
}: {
  onBrowse: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  onPremium: () => void;
}) {
  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.inner}>
        <Text style={s.logo}>CheapAkiya</Text>
        <Text style={s.title}>Japanese homes, in English.</Text>
        <Text style={s.subtitle}>
          Browse curated akiya listings, save favorites, and unlock member features with in-app sign up or sign in.
        </Text>

        <TouchableOpacity style={s.primaryBtn} onPress={onSignUp}>
          <Text style={s.primaryBtnText}>Join free with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.secondaryBtn} onPress={onSignIn}>
          <Text style={s.secondaryBtnText}>Sign in with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.premiumBtn} onPress={onPremium}>
          <Text style={s.premiumBtnText}>Get premium — $12/mo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ghostBtn} onPress={onBrowse}>
          <Text style={s.ghostBtnText}>Browse as guest</Text>
        </TouchableOpacity>

        <View style={s.googleStub}>
          <Text style={s.googleStubText}>Google sign-in next pass</Text>
        </View>
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
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  premiumBtn: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e85d2f', marginBottom: 12 },
  premiumBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  ghostBtn: { alignItems: 'center', paddingVertical: 12 },
  ghostBtnText: { color: '#9ca3af', fontWeight: '700', fontSize: 14 },
  googleStub: { marginTop: 20, alignItems: 'center' },
  googleStubText: { color: '#6b7280', fontSize: 13 },
});
