import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Linking, SafeAreaView, TextInput, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Listing, getSavedListingIds, getMemberStatus, setSavedListing, submitInquiry } from '../lib/api';

const W = Dimensions.get('window').width;

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={s.stat}><Text style={s.statL}>{label}</Text><Text style={s.statV}>{value}</Text></View>;
}
function Pill({ text, tone = 'default' }: { text: string; tone?: 'default' | 'green' | 'blue' | 'orange' | 'purple' }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: 'rgba(255,255,255,0.1)' },
    green: { bg: 'rgba(34,197,94,0.14)', color: '#86efac', border: 'rgba(34,197,94,0.28)' },
    blue: { bg: 'rgba(59,130,246,0.14)', color: '#93c5fd', border: 'rgba(59,130,246,0.28)' },
    orange: { bg: 'rgba(232,93,47,0.14)', color: '#fdba74', border: 'rgba(232,93,47,0.28)' },
    purple: { bg: 'rgba(168,85,247,0.14)', color: '#d8b4fe', border: 'rgba(168,85,247,0.28)' },
  }[tone];
  return <View style={[s.pill, { backgroundColor: tones.bg, borderColor: tones.border }]}><Text style={[s.pillT, { color: tones.color }]}>{text}</Text></View>;
}

export default function ListingDetailScreen() {
  const { params } = useRoute<any>();
  const nav = useNavigation<any>();
  const l: Listing | undefined = params?.listing;
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadMessage, setLeadMessage] = useState('I’m interested in this property. Please send me more details.');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [leadError, setLeadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadMemberContext() {
      if (!l?.id) return;
      try {
        const [status, savedIds] = await Promise.all([getMemberStatus(), getSavedListingIds()]);
        if (!active) return;
        setMemberEmail(status?.email || null);
        setPremium(!!status?.premium);
        setSaved(savedIds.includes(l.id));
        if (status?.email) setLeadEmail(status.email);
      } catch {
        if (!active) return;
        setSaved(false);
      }
    }
    loadMemberContext();
    return () => { active = false; };
  }, [l?.id]);

  if (!l) return <View style={s.center}><Text style={{ color: '#fff' }}>No listing data</Text></View>;

  const listing = l;
  const imgs = listing.images?.length > 0 ? listing.images : [''];
  const locationLabel = [listing.city, listing.prefecture].filter(Boolean).join(', ');

  async function onToggleSave() {
    if (!memberEmail) {
      Alert.alert('Verify first', 'Open the Account tab and verify your CheapAkiya email before saving listings.');
      return;
    }

    try {
      setSaving(true);
      await setSavedListing(listing.id, !saved);
      setSaved(!saved);
    } catch (e: any) {
      Alert.alert('Could not update saved listings', e?.message || 'Try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitInquiry() {
    if (!leadName.trim()) {
      setLeadStatus('error');
      setLeadError('Please enter your name.');
      return;
    }
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      setLeadStatus('error');
      setLeadError('Please enter a valid email.');
      return;
    }
    if (!leadMessage.trim()) {
      setLeadStatus('error');
      setLeadError('Please add a message.');
      return;
    }

    try {
      setLeadStatus('sending');
      setLeadError(null);
      await submitInquiry({
        name: leadName.trim(),
        email: leadEmail.trim(),
        message: leadMessage.trim(),
        listing_slug: listing.slug,
        listing_name: listing.name,
        listing_price: listing.price,
        listing_url: `https://cheapakiya.com/listings/${listing.slug}`,
        member_tier: premium ? 'premium' : 'free',
      });
      setLeadStatus('done');
      setLeadMessage('I’m interested in this property. Please send me more details.');
    } catch (e: any) {
      setLeadStatus('error');
      setLeadError(e?.message || 'Failed to send inquiry');
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: 300 }}>
          <FlatList
            data={imgs}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => <Image source={{ uri: item || '' }} style={{ width: W, height: 300 }} resizeMode="cover" />}
          />
          <TouchableOpacity style={s.back} onPress={() => nav.goBack()}><Text style={{ color: '#fff', fontSize: 20 }}>←</Text></TouchableOpacity>
          {l.isPremium && <View style={s.topPremium}><Text style={s.topPremiumText}>PREMIUM</Text></View>}
        </View>

        <View style={s.content}>
          <Text style={[s.price, l.priceNum === 0 && { color: '#4ade80' }]}>{l.price}</Text>
          <Text style={s.name}>{l.name}</Text>
          <Text style={s.loc}>🇯🇵 {locationLabel || l.region || 'Japan'}{l.region ? ` · ${l.region}` : ''}</Text>

          <View style={s.actionRow}>
            <TouchableOpacity style={[s.btnPrimary, s.actionBtn]} onPress={onToggleSave} disabled={saving}>
              <Text style={s.btnPrimaryText}>{saving ? 'Saving…' : saved ? '♥ Saved' : '♡ Save listing'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.actionBtn]} onPress={() => Linking.openURL(`https://cheapakiya.com/listings/${l.slug}`)}>
              <Text style={s.btnT}>Open web listing</Text>
            </TouchableOpacity>
          </View>

          {!memberEmail && (
            <View style={s.noticeBox}>
              <Text style={s.noticeTitle}>Guest mode</Text>
              <Text style={s.noticeText}>Verify your email in the Account tab to save listings and use member-aware features in the app.</Text>
            </View>
          )}

          {l.isPremium && (
            <View style={s.upgradeBox}>
              <Text style={s.upgradeTitle}>Premium listing</Text>
              <Text style={s.upgradeText}>Some properties and contact paths are intended for members. Upgrade on CheapAkiya to unlock the full premium experience.</Text>
              <TouchableOpacity style={s.btnPrimary} onPress={() => Linking.openURL('https://cheapakiya.com/upgrade')}>
                <Text style={s.btnPrimaryText}>Upgrade on CheapAkiya →</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.grid}>
            <Stat label="Bedrooms" value={l.beds ? `${l.beds} bed` : '—'} />
            <Stat label="Size" value={l.size || '—'} />
            <Stat label="Year Built" value={l.built || '—'} />
            <Stat label="Condition" value={l.condition === 'move_in_ready' ? 'Move-in ready' : l.condition === 'renovation_needed' ? 'Needs work' : (l.condition || '—')} />
            <Stat label="Nearest Station" value={l.stationName || '—'} />
            <Stat label="Walk Time" value={l.stationWalkMin ? `${l.stationWalkMin} min` : '—'} />
            <Stat label="Internet" value={l.internetType ? `${l.internetType}${l.internetSpeedMbps ? ` · ${l.internetSpeedMbps} Mbps` : ''}` : '—'} />
            <Stat label="Risk Score" value={l.disasterScore ? `${l.disasterScore}/5` : '—'} />
          </View>

          <View style={s.badges}>
            {l.subsidyAvailable ? <Pill text="🏛 Government subsidy" tone="green" /> : null}
            {l.internetType === 'fiber' ? <Pill text="📡 Fiber internet" tone="purple" /> : null}
            {(l.disasterScore || 0) >= 4 ? <Pill text="🛡 Lower risk" tone="orange" /> : null}
            {l.condition === 'move_in_ready' ? <Pill text="✓ Move-in ready" tone="blue" /> : null}
          </View>

          {!!l.notes && <View style={s.sec}><Text style={s.secT}>About this property</Text><Text style={s.notes}>{l.notes}</Text></View>}

          <View style={s.leadBox}>
            <Text style={s.secT}>Ask about this property</Text>
            <Text style={s.boxText}>Send an inquiry to CheapAkiya directly from the app.</Text>
            <TextInput value={leadName} onChangeText={setLeadName} placeholder="Your name" placeholderTextColor="#6b7280" style={s.input} />
            <TextInput value={leadEmail} onChangeText={setLeadEmail} placeholder="Your email" placeholderTextColor="#6b7280" autoCapitalize="none" keyboardType="email-address" style={s.input} />
            <TextInput value={leadMessage} onChangeText={setLeadMessage} placeholder="Your message" placeholderTextColor="#6b7280" multiline style={[s.input, s.textarea]} />
            <TouchableOpacity style={s.btnPrimary} onPress={onSubmitInquiry} disabled={leadStatus === 'sending'}>
              <Text style={s.btnPrimaryText}>{leadStatus === 'sending' ? 'Sending…' : 'Send inquiry →'}</Text>
            </TouchableOpacity>
            {leadStatus === 'done' && <Text style={s.success}>Inquiry sent.</Text>}
            {leadStatus === 'error' && <Text style={s.error}>{leadError || 'Failed to send inquiry.'}</Text>}
          </View>

          {(l.subsidyNotes || l.subsidyAmountJPY) && (
            <View style={s.secBox}>
              <Text style={s.secT}>Subsidy / relocation support</Text>
              {!!l.subsidyAmountJPY && <Text style={s.boxBig}>Up to ¥{l.subsidyAmountJPY.toLocaleString()}</Text>}
              {!!l.subsidyNotes && <Text style={s.boxText}>{l.subsidyNotes}</Text>}
              {!!l.subsidyUrl && <TouchableOpacity style={[s.btn, { marginTop: 10 }]} onPress={() => Linking.openURL(l.subsidyUrl!)}><Text style={s.btnT}>Open subsidy source →</Text></TouchableOpacity>}
            </View>
          )}

          <View style={s.secBox}>
            <Text style={s.secT}>Area & logistics</Text>
            <Text style={s.boxText}>Station: {l.stationName || 'Unknown'}{l.stationWalkMin ? ` · about ${l.stationWalkMin} min away` : ''}</Text>
            <Text style={s.boxText}>Hospital: {l.hospitalKm ? `${l.hospitalKm} km` : 'Unknown'}</Text>
            <Text style={s.boxText}>Convenience store: {l.convenienceStoreKm ? `${l.convenienceStoreKm} km` : 'Unknown'}</Text>
            <Text style={s.boxText}>Flood risk: {l.floodRisk || 'Unknown'} · Earthquake risk: {l.earthquakeRisk || 'Unknown'}</Text>
          </View>

          <View style={s.cBox}>
            <Text style={s.cTitle}>Quick actions</Text>
            {!!(l.lat && l.lng) && <TouchableOpacity style={s.btn} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${l.lat},${l.lng}`)}><Text style={s.btnT}>🗺 Open in Google Maps</Text></TouchableOpacity>}
            <TouchableOpacity style={[s.btn, { marginTop: 8 }]} onPress={() => Linking.openURL(`https://cheapakiya.com/listings/${l.slug}`)}><Text style={s.btnT}>View full listing →</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  back: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18, width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  topPremium: { position: 'absolute', top: 14, right: 14, backgroundColor: '#e85d2f', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
  topPremiumText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  content: { padding: 18 },
  price: { color: '#e85d2f', fontSize: 30, fontWeight: '900', marginBottom: 4 },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 5 },
  loc: { color: '#6b7280', fontSize: 12, marginBottom: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtn: { flex: 1 },
  noticeBox: { backgroundColor: 'rgba(59,130,246,0.10)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.22)', marginBottom: 16 },
  noticeTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  noticeText: { color: '#dbeafe', fontSize: 13, lineHeight: 20 },
  upgradeBox: { backgroundColor: 'rgba(232,93,47,0.10)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(232,93,47,0.25)', marginBottom: 16 },
  upgradeTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  upgradeText: { color: '#d1d5db', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  stat: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statL: { color: '#6b7280', fontSize: 10, marginBottom: 4 },
  statV: { color: '#fff', fontSize: 12, fontWeight: '600' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 18 },
  pill: { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  pillT: { fontSize: 11, fontWeight: '700' },
  sec: { marginBottom: 18 },
  secT: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  notes: { color: '#9ca3af', fontSize: 13, lineHeight: 21 },
  secBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 16 },
  leadBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 16 },
  boxBig: { color: '#86efac', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  boxText: { color: '#d1d5db', fontSize: 13, lineHeight: 20, marginBottom: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  cBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 30 },
  cTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  btn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 28, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnPrimary: { backgroundColor: '#e85d2f', borderColor: '#e85d2f', borderWidth: 1, borderRadius: 28, paddingVertical: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  btnT: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  success: { color: '#86efac', marginTop: 10, fontWeight: '700' },
  error: { color: '#f87171', marginTop: 10, fontWeight: '700' },
});
