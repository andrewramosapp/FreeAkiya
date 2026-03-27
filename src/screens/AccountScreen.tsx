import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ActivityIndicator, Linking
} from 'react-native';
import { getMemberStatus, logoutMemberSession, verifyMember } from '../lib/api';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMemberStatus();
      setMemberEmail(data?.email || null);
      setPremium(!!data?.premium);
    } catch {
      setMemberEmail(null);
      setPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function onVerify() {
    if (!email.trim()) {
      setError('Enter the email you use on CheapAkiya.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setStatusMsg(null);
      const result = await verifyMember(email.trim());
      setStatusMsg(result?.tier === 'premium' ? 'Premium member verified.' : 'Free member verified.');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSignOut() {
    try {
      setSubmitting(true);
      setError(null);
      setStatusMsg(null);
      await logoutMemberSession();
      setMemberEmail(null);
      setPremium(false);
      setStatusMsg('Local app session cleared. If the site still shows you signed in, use the web logout too.');
    } catch (e: any) {
      setError(e?.message || 'Sign out failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>Account</Text>
        <Text style={s.subtitle}>Verify your CheapAkiya membership to unlock saved listings and member-aware flows in the app.</Text>
      </View>

      <View style={s.card}>
        {loading ? (
          <View style={s.centerRow}><ActivityIndicator color="#e85d2f" /><Text style={s.muted}>Checking member status…</Text></View>
        ) : (
          <>
            <Text style={s.label}>Current status</Text>
            <Text style={s.value}>{memberEmail ? memberEmail : 'Not verified on this device'}</Text>
            <View style={[s.badge, premium ? s.badgePremium : s.badgeFree]}>
              <Text style={s.badgeText}>{premium ? 'Premium' : memberEmail ? 'Free member' : 'Guest'}</Text>
            </View>
          </>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.label}>Verify membership</Text>
        <Text style={s.help}>Use the same email you use on CheapAkiya. If the site recognizes it, the app will start using your member session for saved listings and related flows.</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#6b7280"
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />
        <TouchableOpacity style={s.primaryBtn} onPress={onVerify} disabled={submitting}>
          <Text style={s.primaryBtnText}>{submitting ? 'Working…' : 'Verify member email'}</Text>
        </TouchableOpacity>
        {memberEmail ? (
          <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={onSignOut} disabled={submitting}>
            <Text style={s.secondaryBtnText}>Clear app session</Text>
          </TouchableOpacity>
        ) : null}
        {statusMsg ? <Text style={s.success}>{statusMsg}</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </View>

      <View style={s.card}>
        <Text style={s.label}>Web handoff</Text>
        <Text style={s.help}>If cookies are fussy in native mode, open the site directly. This is the escape hatch while we harden the mobile auth story.</Text>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => Linking.openURL('https://cheapakiya.com/members')}>
          <Text style={s.secondaryBtnText}>Open member page on CheapAkiya</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={() => Linking.openURL('https://cheapakiya.com/join')}>
          <Text style={s.secondaryBtnText}>Join / upgrade on CheapAkiya</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={() => Linking.openURL('https://cheapakiya.com/api/logout')}>
          <Text style={s.secondaryBtnText}>Open web logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b0b0b', padding: 16 },
  header: { paddingTop: 12, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9ca3af', fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 14 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  value: { color: '#d1d5db', fontSize: 15 },
  help: { color: '#9ca3af', fontSize: 13, lineHeight: 20, marginBottom: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  primaryBtn: { marginTop: 12, backgroundColor: '#e85d2f', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },
  success: { color: '#86efac', fontWeight: '700', marginTop: 10 },
  error: { color: '#f87171', fontWeight: '700', marginTop: 10 },
  muted: { color: '#9ca3af', marginLeft: 10 },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: 12 },
  badgePremium: { backgroundColor: 'rgba(232,93,47,0.18)', borderWidth: 1, borderColor: 'rgba(232,93,47,0.35)' },
  badgeFree: { backgroundColor: 'rgba(59,130,246,0.18)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
