import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Linking, SafeAreaView, TextInput, Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Listing, getSavedListingIds, setSavedListing, submitInquiry } from '../lib/api';
import { useAuth } from '../../App';

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
  const { member } = useAuth();
  const l: Listing | undefined = params?.listing;
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState(member?.email || '');
  const [leadMessage, setLeadMessage] = useState('I’m interested in this property. Please send me more details.');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [leadError, setLeadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadSavedState() {
      if (!l?.id || !member?.email) return;
      try {
        const savedIds = await getSavedListingIds();
        if (!active) return;
        setSaved(savedIds.includes(l.id));
      } catch {
        if (!active) return;
        setSaved(false);
      }
    }
    loadSavedState();
    return () => { active = false; };
  }, [l?.id, member?.email]);

  useEffect(() => {
    if (member?.email) setLeadEmail(member.email);
  }, [member?.email]);

  if (!l) return <View style={s.center}><Text style={{ color: '#fff' }}>No listing data</Text></View>;

  const listing = l;
  const imgs = listing.images?.length > 0 ? listing.images : [''];
  const locationLabel = [listing.city, listing.prefecture].filter(Boolean).join(', ');
  const hasCoords = !!(listing.lat && listing.lng);
  const isPremiumMember = member?.tier === 'premium';
  const isFreeMember = member?.tier === 'free';
  const isGuest = !member;
  const isLockedPremium = !!listing.isPremium && !isPremiumMember;
  const canSeeMemberActions = !!member;

  async function onToggleSave() {
    if (!member?.email) {
      Alert.alert('Members only', 'Join free or sign in to save listings.');
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
    if (!member?.email) {
      Alert.alert('Members only', 'Join free or sign in to contact CheapAkiya from the app.');
      return;
    }
    if (listing.isPremium && !isPremiumMember) {
      Alert.alert('Premium required', 'Upgrade to premium to inquire about premium listings.');
      return;
    }
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
        member_tier: isPremiumMember ? 'premium' : 'free',
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
          {listing.isPremium && <View style={s.topPremium}><Text style={s.topPremiumText}>PREMIUM</Text></View>}
        </View>

        <View style={s.content}>
          <Text style={[s.price, listing.priceNum === 0 && { color: '#4ade80' }]}>{listing.price}</Text>
          <Text style={s.name}>{listing.name}</Text>
          <Text style={s.loc}>🇯🇵 {locationLabel || listing.region || 'Japan'}{listing.region ? ` · ${listing.region}` : ''}</Text>

          <View style={s.actionRow}>
            <TouchableOpacity style={[s.btnPrimary, s.actionBtn]} onPress={onToggleSave} disabled={saving}>
              <Text style={s.btnPrimaryText}>{saving ? 'Saving…' : saved ? '♥ Saved' : '♡ Save listing'}</Text>
            </TouchableOpacity>
            {!!hasCoords && (
              <TouchableOpacity style={[s.btn, s.actionBtn]} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${listing.lat},${listing.lng}`)}>
                <Text style={s.btnT}>Open Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>

          {isGuest && (
            <View style={s.noticeBox}>
              <Text style={s.noticeTitle}>Join free to unlock member features</Text>
              <Text style={s.noticeText}>Sign up or sign in to save listings and contact CheapAkiya from the app.</Text>
            </View>
          )}

          {isFreeMember && listing.isPremium && (
            <View style={s.upgradeBox}>
              <Text style={s.upgradeTitle}>Premium listing</Text>
              <Text style={s.upgradeText}>This listing is reserved for premium members. Upgrade to unlock full access, member-only listings, and direct contact details.</Text>
              <TouchableOpacity style={s.btnPrimary} onPress={() => Linking.openURL('https://cheapakiya.com/upgrade')}>
                <Text style={s.btnPrimaryText}>Upgrade to premium →</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={s.grid}>
            <Stat label="Bedrooms" value={listing.beds ? `${listing.beds} bed` : '—'} />
            <Stat label="Size" value={listing.size || '—'} />
            <Stat label="Year Built" value={listing.built || '—'} />
            <Stat label="Condition" value={isLockedPremium ? 'Premium only' : (listing.condition === 'move_in_ready' ? 'Move-in ready' : listing.condition === 'renovation_needed' ? 'Needs work' : (listing.condition || '—'))} />
            <Stat label="Nearest Station" value={isLockedPremium ? 'Premium only' : (listing.stationName || '—')} />
            <Stat label="Walk Time" value={isLockedPremium ? 'Premium only' : (listing.stationWalkMin ? `${listing.stationWalkMin} min` : '—')} />
            <Stat label="Internet" value={isLockedPremium ? 'Premium only' : (listing.internetType ? `${listing.internetType}${listing.internetSpeedMbps ? ` · ${listing.internetSpeedMbps} Mbps` : ''}` : '—')} />
            <Stat label="Risk Score" value={isLockedPremium ? 'Premium only' : (listing.disasterScore ? `${listing.disasterScore}/5` : '—')} />
          </View>

          <View style={s.badges}>
            {!isLockedPremium && listing.subsidyAvailable ? <Pill text="🏛 Government subsidy" tone="green" /> : null}
            {!isLockedPremium && listing.internetType === 'fiber' ? <Pill text="📡 Fiber internet" tone="purple" /> : null}
            {!isLockedPremium && (listing.disasterScore || 0) >= 4 ? <Pill text="🛡 Lower risk" tone="orange" /> : null}
            {!isLockedPremium && listing.condition === 'move_in_ready' ? <Pill text="✓ Move-in ready" tone="blue" /> : null}
          </View>

          {!isLockedPremium && !!listing.notes && <View style={s.sec}><Text style={s.secT}>About this property</Text><Text style={s.notes}>{listing.notes}</Text></View>}
          {isLockedPremium && <View style={s.sec}><Text style={s.secT}>About this property</Text><Text style={s.notes}>Upgrade to premium to view the full property notes, logistics, and enriched details.</Text></View>}

          <View style={s.mapSection}>
            <Text style={s.secT}>Location</Text>
            {hasCoords ? (
              <View style={s.mapFrame}>
                <MapView
                  style={s.map}
                  initialRegion={{
                    latitude: listing.lat!,
                    longitude: listing.lng!,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  <Marker coordinate={{ latitude: listing.lat!, longitude: listing.lng! }} />
                </MapView>
              </View>
            ) : (
              <View style={s.mapFallback}><Text style={s.mapFallbackText}>Location available for {listing.city}, {listing.prefecture}</Text></View>
            )}
            <Text style={s.mapCaption}>📍 {listing.city}, {listing.prefecture} Prefecture, Japan</Text>
          </View>

          {canSeeMemberActions ? (
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
          ) : null}

          {!isLockedPremium && (listing.subsidyNotes || listing.subsidyAmountJPY) && (
            <View style={s.secBox}>
              <Text style={s.secT}>Subsidy / relocation support</Text>
              {!!listing.subsidyAmountJPY && <Text style={s.boxBig}>Up to ¥{listing.subsidyAmountJPY.toLocaleString()}</Text>}
              {!!listing.subsidyNotes && <Text style={s.boxText}>{listing.subsidyNotes}</Text>}
              {!!listing.subsidyUrl && <TouchableOpacity style={[s.btn, { marginTop: 10 }]} onPress={() => Linking.openURL(listing.subsidyUrl!)}><Text style={s.btnT}>Open subsidy source →</Text></TouchableOpacity>}
            </View>
          )}

          {!isLockedPremium && (
            <View style={s.secBox}>
              <Text style={s.secT}>Area & logistics</Text>
              <Text style={s.boxText}>Station: {listing.stationName || 'Unknown'}{listing.stationWalkMin ? ` · about ${listing.stationWalkMin} min away` : ''}</Text>
              <Text style={s.boxText}>Hospital: {listing.hospitalKm ? `${listing.hospitalKm} km` : 'Unknown'}</Text>
              <Text style={s.boxText}>Convenience store: {listing.convenienceStoreKm ? `${listing.convenienceStoreKm} km` : 'Unknown'}</Text>
              <Text style={s.boxText}>Flood risk: {listing.floodRisk || 'Unknown'} · Earthquake risk: {listing.earthquakeRisk || 'Unknown'}</Text>
            </View>
          )}

          <View style={s.cBox}>
            <Text style={s.cTitle}>Quick actions</Text>
            {!!(listing.lat && listing.lng) && <TouchableOpacity style={s.btn} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${listing.lat},${listing.lng}`)}><Text style={s.btnT}>🗺 Open in Google Maps</Text></TouchableOpacity>}
            <TouchableOpacity style={[s.btn, { marginTop: 8 }]} onPress={() => Linking.openURL(`https://cheapakiya.com/listings/${listing.slug}`)}><Text style={s.btnT}>View full listing →</Text></TouchableOpacity>
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
  mapSection: { marginBottom: 18 },
  mapFrame: { height: 260, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#111827', marginTop: 8 },
  map: { flex: 1 },
  mapFallback: { height: 160, borderRadius: 16, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  mapFallbackText: { color: '#9ca3af', fontSize: 14 },
  mapCaption: { color: '#6b7280', fontSize: 12, marginTop: 8 },
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
