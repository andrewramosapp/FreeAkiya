import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ActivityIndicator, Linking, ScrollView, Switch
} from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { logoutMemberSession, verifyMember, updateNewsletterConsent } from '../lib/api';
import { useAuth } from '../../App';

export default function AccountScreen() {
  const { member, setMember, refreshPurchases, setShowPaywall } = useAuth();
  const [email, setEmail] = useState(member?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newsletterOn, setNewsletterOn] = useState<boolean | null>(null);
  const [newsletterSaving, setNewsletterSaving] = useState(false);

  // Load newsletter consent state from Beehiiv on mount
  React.useEffect(() => {
    if (!member?.email) return;
    fetch(`https://cheapakiya.com/api/mobile/newsletter-consent?email=${encodeURIComponent(member.email)}`)
      .then(r => r.json())
      .then(d => { if (typeof d?.consent === 'boolean') setNewsletterOn(d.consent); })
      .catch(() => setNewsletterOn(false));
  }, [member?.email]);

  async function onToggleNewsletter(val: boolean) {
    if (!member?.email) return;
    setNewsletterOn(val);
    setNewsletterSaving(true);
    try {
      await updateNewsletterConsent(member.email, val);
    } catch {
      setNewsletterOn(v => v === null ? null : !val); // revert on error
    } finally {
      setNewsletterSaving(false);
    }
  }

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
      if (!result?.tier) throw new Error('Verification failed');
      await setMember({ email: email.trim().toLowerCase(), tier: result.tier });
      await refreshPurchases();
      setStatusMsg(result.tier === 'premium' ? 'Premium member verified.' : 'Free member verified.');
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
      await setMember(null);
      setStatusMsg('Logged out on this device.');
      setEmail('');
    } catch (e: any) {
      setError(e?.message || 'Log out failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function openCustomerCenter() {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e: any) {
      setError(e?.message || 'Could not open Customer Center');
    }
  }

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Account</Text>
          <Text style={s.subtitle}>Manage your CheapAkiya membership in the app.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Current status</Text>
          <Text style={s.value}>{member?.email ? member.email : 'Not signed in on this device'}</Text>
          <View style={[s.badge, member?.tier === 'premium' ? s.badgePremium : s.badgeFree]}>
            <Text style={s.badgeText}>{member?.tier === 'premium' ? 'Premium' : member ? 'Free member' : 'Guest'}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.label}>Membership</Text>
          {!member?.email ? (
            <TouchableOpacity style={s.primaryBtn} onPress={() => setShowPaywall(true)}>
              <Text style={s.primaryBtnText}>See Pro options</Text>
            </TouchableOpacity>
          ) : null}
          {member?.email && member.tier !== 'premium' ? (
            <TouchableOpacity style={s.primaryBtn} onPress={() => setShowPaywall(true)}>
              <Text style={s.primaryBtnText}>Upgrade to Cheap Akiya Pro</Text>
            </TouchableOpacity>
          ) : null}
          {member?.email ? (
            <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={openCustomerCenter}>
              <Text style={s.secondaryBtnText}>Open Customer Center</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={s.card}>
          <Text style={s.label}>Verify membership</Text>
          <Text style={s.help}>Use the same email you use on CheapAkiya to sign in on this device.</Text>
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
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Verify member email</Text>}
          </TouchableOpacity>
          {member?.email ? (
            <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={onSignOut} disabled={submitting}>
              <Text style={s.secondaryBtnText}>Log out</Text>
            </TouchableOpacity>
          ) : null}
          {statusMsg ? <Text style={s.success}>{statusMsg}</Text> : null}
          {error ? <Text style={s.error}>{error}</Text> : null}
        </View>

        {member?.email && (
          <View style={s.card}>
            <Text style={s.label}>Email preferences</Text>
            <View style={s.newsletterRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.newsletterTitle}>Property update emails</Text>
                <Text style={s.newsletterSub}>
                  Receive our newsletter with new listings and akiya tips.
                  {newsletterSaving ? '  Saving...' : ''}
                </Text>
              </View>
              <Switch
                value={newsletterOn === true}
                onValueChange={onToggleNewsletter}
                trackColor={{ false: '#374151', true: '#e85d2f' }}
                thumbColor="#fff"
                disabled={newsletterSaving || newsletterOn === null}
              />
            </View>
            <Text style={s.newsletterNote}>
              App sign-ups are not added to our mailing list by default. Toggle on to subscribe.
            </Text>
          </View>
        )}

        <View style={s.card}>
          <Text style={s.label}>Web handoff</Text>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => Linking.openURL('https://cheapakiya.com/members')}>
            <Text style={s.secondaryBtnText}>Open member page on CheapAkiya</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.secondaryBtn, { marginTop: 10 }]} onPress={() => Linking.openURL('https://cheapakiya.com/join')}>
            <Text style={s.secondaryBtnText}>Join / upgrade on CheapAkiya</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 16, paddingBottom: 120 },
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
  newsletterRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  newsletterTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  newsletterSub:   { color: '#9ca3af', fontSize: 12, lineHeight: 17 },
  newsletterNote:  { color: '#4b5563', fontSize: 11, lineHeight: 16, marginTop: 4 },
  success: { color: '#86efac', fontWeight: '700', marginTop: 10 },
  error: { color: '#f87171', fontWeight: '700', marginTop: 10 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: 12 },
  badgePremium: { backgroundColor: 'rgba(232,93,47,0.18)', borderWidth: 1, borderColor: 'rgba(232,93,47,0.35)' },
  badgeFree: { backgroundColor: 'rgba(59,130,246,0.18)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
