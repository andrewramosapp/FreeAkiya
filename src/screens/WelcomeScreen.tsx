import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function WelcomeScreen({
  onSignUp,
  onSignIn,
  onPremium,
  onGoogle,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
  onPremium: () => void;
  onGoogle: () => void;
}) {
  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.inner}>
        <Text style={s.logo}>CheapAkiya</Text>
        <Text style={s.title}>Japanese homes, in English.</Text>
        <Text style={s.subtitle}>
          Sign in or create an account to browse listings, save homes, and unlock member features.
        </Text>

        <TouchableOpacity style={s.googleBtn} onPress={onGoogle}>
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.primaryBtn} onPress={onSignUp}>
          <Text style={s.primaryBtnText}>Join free with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.secondaryBtn} onPress={onSignIn}>
          <Text style={s.secondaryBtnText}>Sign in with email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.premiumBtn} onPress={onPremium}>
          <Text style={s.premiumBtnText}>Get premium — $12/mo</Text>
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
  googleBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  googleBtnText: { color: '#111827', fontWeight: '800', fontSize: 16 },
  primaryBtn: { backgroundColor: '#e85d2f', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  secondaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  premiumBtn: { backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#e85d2f', marginBottom: 12 },
  premiumBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
