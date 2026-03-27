import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { createPremiumCheckout, subscribeEmail, verifyMember } from '../lib/api';

export default function AuthEmailScreen({
  mode,
  onBack,
  onAuthed,
}: {
  mode: 'signup' | 'signin' | 'premium';
  onBack: () => void;
  onAuthed: (member: { email: string; tier: 'free' | 'premium' }) => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit() {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('Enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      if (mode === 'signup') {
        await subscribeEmail(clean);
        setMessage('Subscribed. Verifying membership…');
      }

      if (mode === 'premium') {
        const checkout = await createPremiumCheckout(clean);
        if (checkout?.url) {
          await Linking.openURL(checkout.url);
          setMessage('Premium checkout opened. Come back after payment and sign in with the same email.');
          return;
        }
        throw new Error('Could not open premium checkout');
      }

      const result = await verifyMember(clean);
      if (!result?.tier) throw new Error('Could not verify membership');
      onAuthed({ email: clean, tier: result.tier });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.inner}>
        <TouchableOpacity onPress={onBack}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>
          {mode === 'signup' ? 'Join free with email' : mode === 'premium' ? 'Start premium' : 'Sign in with email'}
        </Text>
        <Text style={s.subtitle}>
          {mode === 'signup'
            ? 'Use your email to join CheapAkiya. We’ll add you to the free member list and verify you in-app.'
            : mode === 'premium'
              ? 'Enter your email to start premium checkout. For now this opens the existing payment flow; App Store billing is the next implementation step.'
              : 'Enter the email you used with CheapAkiya and we’ll verify your member access.'}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#6b7280"
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />

        <TouchableOpacity style={s.primaryBtn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>{mode === 'signup' ? 'Join free' : mode === 'premium' ? 'Continue to premium' : 'Sign in'}</Text>}
        </TouchableOpacity>

        {message ? <Text style={s.success}>{message}</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  back: { color: '#9ca3af', fontSize: 15, marginBottom: 20 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 10 },
  subtitle: { color: '#9ca3af', fontSize: 15, lineHeight: 23, marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  primaryBtn: { marginTop: 14, backgroundColor: '#e85d2f', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  success: { color: '#86efac', fontWeight: '700', marginTop: 12 },
  error: { color: '#f87171', fontWeight: '700', marginTop: 12 },
});
