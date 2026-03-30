import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Listing } from '../lib/api';

// ── Prefecture Data ────────────────────────────────────────────────────────────

const PREFECTURE_DATA: Record<string, {
  name: string;
  flag: string;
  amount: string;
  highlight: string;
  programs: { title: string; amount: string; description: string; eligibility: string }[];
  notes: string;
  contact: { label: string; detail: string }[];
}> = {
  kochi: {
    name: 'Kochi', flag: '🌊', amount: '¥3,000,000', highlight: "Japan's most generous grant",
    programs: [{
      title: 'Kochi Migration Support',
      amount: 'Up to ¥3,000,000 (~$20,100) for families',
      description: "One of Japan's highest migration grants. Kochi is serious about attracting new residents — families with children receive the highest amounts.",
      eligibility: 'Relocating to Kochi. Families with children under 18 qualify for maximum amounts.',
    }],
    notes: "Kochi has Japan's highest akiya vacancy rate (~21%) and some of the most aggressive migration incentives. Beautiful Pacific coast, excellent food culture.",
    contact: [
      { label: 'Kochi Migration Support Center', detail: '03-5579-8349 (Tokyo office) or 088-855-5955 (local)' },
      { label: 'Email', detail: 'info@kochi-iju.jp' },
      { label: 'English support', detail: 'Kochi has active English migration support — kochi-iju.jp' },
    ],
  },
  wakayama: {
    name: 'Wakayama', flag: '🌸', amount: '¥2,000,000', highlight: 'Near Osaka — best of both worlds',
    programs: [
      {
        title: 'Rural Migration Support',
        amount: 'Up to ¥2,000,000 (~$13,400)',
        description: 'One of Japan\'s largest migration subsidies. Wakayama offers substantial support for families willing to relocate to rural areas.',
        eligibility: 'Families with children receive higher amounts. Must commit to residency for at least 5 years.',
      },
      {
        title: 'Home Renovation Grant',
        amount: 'Up to ¥500,000 (~$3,350)',
        description: 'For renovating a vacant home. Some municipalities within Wakayama offer additional matching grants.',
        eligibility: 'Purchasing and renovating an akiya within Wakayama.',
      },
    ],
    notes: 'Wakayama (~20% vacancy rate) borders Nara and Osaka — relatively accessible while still qualifying for rural migration grants.',
    contact: [
      { label: 'Wakayama Migration Support', detail: '073-441-2794' },
      { label: 'Email', detail: 'chiiki@pref.wakayama.lg.jp' },
      { label: 'Note', detail: 'Contact the specific municipality directly for local grant details' },
    ],
  },
  fukushima: {
    name: 'Fukushima', flag: '🏔', amount: '¥2,000,000', highlight: 'Recovery grants available',
    programs: [{
      title: 'Recovery Migration Support',
      amount: 'Up to ¥2,000,000 (~$13,400)',
      description: "As part of post-disaster recovery efforts, Fukushima offers some of Japan's highest migration grants. Coastal exclusion zones have lifted in most areas.",
      eligibility: 'Relocating to designated recovery areas in Fukushima.',
    }],
    notes: 'Radiation levels in most of Fukushima are now at normal background levels. The government offers substantial incentives. Worth researching specific towns carefully.',
    contact: [
      { label: 'Fukushima Recovery Migration Desk', detail: '024-521-7917' },
      { label: 'Email', detail: 'chiikishinkou@pref.fukushima.lg.jp' },
      { label: 'Note', detail: 'Radiation levels are normal in most areas. Staff can provide area-specific safety data. Grants are highest in recovery zones.' },
    ],
  },
  shimane: {
    name: 'Shimane', flag: '⛩', amount: '¥1,500,000', highlight: 'Highest vacancy rate in Japan',
    programs: [
      {
        title: 'Migration Support Grant',
        amount: 'Up to ¥1,000,000 (~$6,700)',
        description: "Shimane offers one of Japan's most generous relocation packages for people moving from urban areas. Families receive higher amounts.",
        eligibility: 'Moving from outside Shimane prefecture, purchasing or renting an akiya, minimum 5-year residency commitment.',
      },
      {
        title: 'Akiya Renovation Grant',
        amount: 'Up to ¥500,000 (~$3,350)',
        description: 'Subsidy for renovating a vacant home to make it livable. Must use a certified local contractor.',
        eligibility: 'Purchasing a registered akiya in Shimane and renovating within 1 year of purchase.',
      },
    ],
    notes: "Shimane has one of Japan's highest akiya vacancy rates (~18%) and actively incentivizes migration. Some individual towns (Tsuwano, Oki Islands) offer additional local grants on top of prefectural programs.",
    contact: [
      { label: 'Shimane Prefecture Migration Support', detail: '0852-22-5609 (ask for English support)' },
      { label: 'Email', detail: 'chiiki@pref.shimane.lg.jp' },
    ],
  },
  tottori: {
    name: 'Tottori', flag: '🦌', amount: '¥1,300,000', highlight: 'English support available',
    programs: [
      {
        title: 'U-turn / I-turn Migration Grant',
        amount: 'Up to ¥1,000,000 (~$6,700)',
        description: 'Grant for people relocating to Tottori from major urban centers (Tokyo, Osaka, Nagoya metro areas).',
        eligibility: 'Relocating from Tokyo metropolitan area or other designated urban zones. Remote workers and self-employed may also qualify.',
      },
      {
        title: 'Akiya Purchase Subsidy',
        amount: 'Up to ¥300,000 (~$2,000)',
        description: 'Direct subsidy on purchase of a registered vacant home.',
        eligibility: 'Purchasing from the official Tottori akiya bank registry.',
      },
    ],
    notes: "Tottori is Japan's least populous prefecture and actively recruits new residents. The Tottori akiya bank portal has English support.",
    contact: [
      { label: 'Tottori Migration Support Center', detail: '0857-26-7861' },
      { label: 'Email', detail: 'furusato@pref.tottori.lg.jp' },
      { label: 'Note', detail: 'Tottori akiya bank has English support — mention you are a foreign national' },
    ],
  },
  hokkaido: {
    name: 'Hokkaido', flag: '🐻', amount: '¥1,000,000', highlight: 'Individual towns offer more',
    programs: [{
      title: 'Rural Migration Support',
      amount: 'Up to ¥1,000,000 (~$6,700)',
      description: 'Hokkaido offers grants for migration to rural towns. Sapporo area is excluded — must be moving to smaller communities.',
      eligibility: 'Relocating to a designated rural community in Hokkaido.',
    }],
    notes: 'Individual Hokkaido towns (Kamishihoro, Shimokawa, etc.) offer their own generous programs — sometimes including free land. Research the specific town you\'re interested in.',
    contact: [
      { label: 'Hokkaido Prefecture Akiya Desk', detail: '011-204-5268' },
      { label: 'Note', detail: 'For rural town programs, contact the specific town hall directly. Kamishihoro and Shimokawa have dedicated English migration support.' },
    ],
  },
  nagano: {
    name: 'Nagano', flag: '🏔', amount: '¥500,000', highlight: 'Great fiber internet + mountains',
    programs: [{
      title: 'Migration Support Grant',
      amount: 'Up to ¥500,000 (~$3,350)',
      description: 'Nagano supports rural migration with grants for purchasing or renovating vacant homes.',
      eligibility: 'Moving from outside Nagano. Remote workers especially welcomed — Nagano has good fiber coverage.',
    }],
    notes: 'Nagano is popular with remote workers due to excellent internet coverage, mountains, skiing, and proximity to Tokyo (1.5hrs by shinkansen). Individual towns like Karuizawa have their own programs.',
    contact: [
      { label: 'Nagano Prefecture Migration Support', detail: '026-235-7517' },
      { label: 'Email', detail: 'chiikishinko@pref.nagano.lg.jp' },
      { label: 'Remote worker desk', detail: 'Nagano specifically courts remote workers — mention this when calling' },
    ],
  },
  nagasaki: {
    name: 'Nagasaki', flag: '🏝', amount: '¥500,000+', highlight: 'Island migration bonuses',
    programs: [{
      title: 'Island Migration Support',
      amount: 'Up to ¥500,000+ (~$3,350+)',
      description: 'Nagasaki has over 500 islands, many with dedicated migration support. Island relocation packages can be significantly higher.',
      eligibility: 'Relocating to Nagasaki, especially to island communities.',
    }],
    notes: 'Individual cities and islands in Nagasaki (Goto Islands, Tsushima, Iki) often have separate programs worth researching. Some offer free land alongside the home.',
    contact: [
      { label: 'Nagasaki Prefecture Housing Division', detail: '095-895-2367' },
      { label: 'Island migration inquiries', detail: 'Contact the specific island town office directly — Goto Islands, Tsushima, Iki each have their own contacts' },
    ],
  },
};

const PREFECTURES_LIST = [
  'kochi', 'wakayama', 'fukushima', 'shimane', 'tottori', 'hokkaido', 'nagano', 'nagasaki',
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

// ── Prefecture Detail View ─────────────────────────────────────────────────────

function PrefectureDetail({ slug, onBack }: { slug: string; onBack: () => void }) {
  const data = PREFECTURE_DATA[slug];
  if (!data) return null;

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backRow} onPress={onBack}>
          <Text style={s.back}>← Back to subsidies</Text>
        </TouchableOpacity>

        <View style={s.heroBadgeWrap}>
          <Text style={s.heroBadgeText}>🏛 Government Subsidy Programs</Text>
        </View>
        <Text style={s.heroTitle}>{data.flag} {data.name} Prefecture</Text>
        <Text style={s.heroSub}>Migration incentives and akiya grants available to foreign buyers</Text>

        {/* Programs */}
        {data.programs.map((p, i) => (
          <View key={i} style={s.programCard}>
            <View style={s.programHeader}>
              <Text style={s.programTitle}>{p.title}</Text>
              <View style={s.amountBadge}>
                <Text style={s.amountBadgeText}>{(p.amount.match(/¥[\d,]+\+?/) || [''])[0]}</Text>
              </View>
            </View>
            <Text style={s.programDesc}>{p.description}</Text>
            <View style={s.eligibilityBox}>
              <Text style={s.eligibilityLabel}>ELIGIBILITY</Text>
              <Text style={s.eligibilityText}>{p.eligibility}</Text>
            </View>
          </View>
        ))}

        {/* Notes */}
        <View style={s.notesCard}>
          <Text style={s.notesIcon}>ℹ️ Local notes</Text>
          <Text style={s.notesText}>{data.notes}</Text>
        </View>

        {/* Contact */}
        <Text style={s.sectionHead}>Who to contact</Text>
        {data.contact.map((c, i) => (
          <View key={i} style={s.contactCard}>
            <Text style={s.contactLabel}>{c.label}</Text>
            <Text style={s.contactDetail}>{c.detail}</Text>
          </View>
        ))}

        <Text style={s.disclaimer}>
          ⚠️ Grant amounts and eligibility change year to year. Always confirm current details directly with the prefecture before purchasing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Hub View ───────────────────────────────────────────────────────────────────

function HubScreen({ onBack, onSelectPrefecture }: { onBack: () => void; onSelectPrefecture: (slug: string) => void }) {
  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backRow} onPress={onBack}>
          <Text style={s.back}>← Back to listings</Text>
        </TouchableOpacity>

        <View style={s.heroBadgeWrap}>
          <Text style={s.heroBadgeText}>🏛 Government Subsidy Guide</Text>
        </View>
        <Text style={s.heroTitle}>Japan pays you to move there</Text>
        <Text style={s.heroSub}>
          Japan's rural depopulation crisis means many prefectures actively pay people to relocate.
          Subsidies range from ¥500,000 to ¥3,000,000+ — on top of already cheap property prices.
          Foreign nationals are eligible for most programs.
        </Text>

        {/* Key stats */}
        <View style={s.statsRow}>
          {[
            { stat: '¥3M+', label: 'Max grant available' },
            { stat: '47', label: 'Prefectures with programs' },
            { stat: '0', label: 'Restrictions on foreigners' },
          ].map(item => (
            <View key={item.stat} style={s.statBox}>
              <Text style={s.statNum}>{item.stat}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Prefecture cards — tappable */}
        <Text style={s.sectionHead}>Prefectures with detailed guides</Text>
        {PREFECTURES_LIST.map(slug => {
          const p = PREFECTURE_DATA[slug];
          return (
            <TouchableOpacity key={slug} style={s.prefCard} onPress={() => onSelectPrefecture(slug)} activeOpacity={0.75}>
              <View style={s.prefCardLeft}>
                <Text style={s.prefFlag}>{p.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.prefName}>{p.name}</Text>
                  <Text style={s.prefHighlight}>{p.highlight}</Text>
                </View>
              </View>
              <View style={s.prefRight}>
                <View style={s.prefAmountBadge}>
                  <Text style={s.prefAmount}>{p.amount}</Text>
                </View>
                <Text style={s.prefArrow}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* How to apply */}
        <Text style={[s.sectionHead, { marginTop: 8 }]}>How to apply</Text>
        <View style={s.card}>
          {[
            'Find a property you like on CheapAkiya',
            "Contact the prefecture's migration support office (see each prefecture guide for numbers)",
            'Register your intention to migrate before purchasing',
            'Purchase the property and establish residency',
            'Apply for the grant — most paid within 1 year of residency',
          ].map((step, i) => (
            <View key={i} style={s.stepRow}>
              <Text style={s.stepNum}>{i + 1}</Text>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
          <Text style={s.cardDisclaimer}>Programs change. Always verify current amounts directly with the prefecture before purchasing.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Listing-specific Subsidy View ──────────────────────────────────────────────

function ListingSubsidyScreen({ listing, onBack, onHubTap }: { listing: Listing; onBack: () => void; onHubTap: () => void }) {
  const hasAmount = !!listing.subsidyAmountJPY;
  const hasNotes  = !!listing.subsidyNotes;
  const prefecture = listing.prefecture || listing.region || 'Japan';

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.backRow} onPress={onBack}>
          <Text style={s.back}>← Back to listing</Text>
        </TouchableOpacity>

        <View style={s.heroBadgeWrap}>
          <Text style={s.heroBadgeText}>🏛 Government Subsidy</Text>
        </View>
        <Text style={s.heroTitle}>
          {listing.name || 'This property'} may qualify for a relocation subsidy.
        </Text>
        <Text style={s.heroSub}>
          {prefecture} Prefecture — Japan's akiya subsidy programs offer financial support to buyers who relocate and renovate vacant rural properties.
        </Text>

        {hasAmount && (
          <View style={[s.card, s.amountCard]}>
            <Text style={s.cardLabel}>Potential subsidy amount</Text>
            <Text style={s.amountText}>¥{listing.subsidyAmountJPY!.toLocaleString()}</Text>
            <Text style={s.amountSub}>≈ ${Math.round(listing.subsidyAmountJPY! / 150).toLocaleString()} USD</Text>
          </View>
        )}

        <View style={s.card}>
          <Text style={s.cardLabel}>Subsidy details</Text>
          <Text style={s.notes}>
            {hasNotes ? listing.subsidyNotes : 'Contact your local municipal office or the Japan Akiya Bank network for eligibility requirements and application instructions. Subsidies vary by municipality and may require renovation, registration of residence, and a minimum stay period.'}
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardLabel}>Property</Text>
          <Row label="Location" value={[listing.city, listing.prefecture].filter(Boolean).join(', ') || 'Japan'} />
          {listing.priceNum != null && <Row label="Asking price" value={listing.price || '—'} />}
          {listing.condition && (
            <Row label="Condition" value={listing.condition === 'move_in_ready' ? 'Move-in ready' : 'Renovation needed'} />
          )}
        </View>

        <View style={s.card}>
          <Text style={s.cardLabel}>Typical eligibility requirements</Text>
          {[
            'Move primary residence to the property',
            'Register address at the property within 1 year',
            'Commit to living there for 5–10 years (varies)',
            'May require renovation spending above a threshold',
            'Cannot already own a home in the same municipality',
          ].map((req, i) => (
            <View key={i} style={s.stepRow}>
              <Text style={s.reqBullet}>✓</Text>
              <Text style={s.stepText}>{req}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.hubTeaser} onPress={onHubTap}>
          <Text style={s.hubTeaserTitle}>🏛 See all 8 prefecture subsidy guides →</Text>
          <Text style={s.hubTeaserSub}>Grants up to ¥3M · Foreign buyers eligible</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          Subsidy availability and amounts are subject to change. Always confirm current terms directly with the relevant municipal government office.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export default function SubsidyScreen() {
  const { params } = useRoute<any>();
  const nav = useNavigation<any>();
  const listing: Listing | null = params?.listing || null;
  const isHub = params?.prefectureHub || !listing;

  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  const goBack = () => nav.goBack();

  // Prefecture detail view (from hub)
  if (selectedPrefecture) {
    return (
      <PrefectureDetail
        slug={selectedPrefecture}
        onBack={() => setSelectedPrefecture(null)}
      />
    );
  }

  // Hub view
  if (isHub) {
    return (
      <HubScreen
        onBack={goBack}
        onSelectPrefecture={(slug) => setSelectedPrefecture(slug)}
      />
    );
  }

  // Listing-specific view
  return (
    <ListingSubsidyScreen
      listing={listing!}
      onBack={goBack}
      onHubTap={() => { setSelectedPrefecture(null); nav.push('Subsidy', { prefectureHub: true }); }}
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrap:              { flex: 1, backgroundColor: '#0a0a0a' },
  scroll:            { padding: 16, paddingBottom: 60 },
  backRow:           { marginBottom: 16 },
  back:              { color: '#9ca3af', fontSize: 14, fontWeight: '600' },

  heroBadgeWrap:     { alignSelf: 'flex-start', backgroundColor: 'rgba(34,197,94,0.14)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(34,197,94,0.28)', marginBottom: 12 },
  heroBadgeText:     { color: '#86efac', fontSize: 12, fontWeight: '800' },
  heroTitle:         { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 30, marginBottom: 10 },
  heroSub:           { color: '#9ca3af', fontSize: 14, lineHeight: 21, marginBottom: 20 },

  statsRow:          { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statBox:           { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  statNum:           { color: '#e85d2f', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  statLabel:         { color: '#6b7280', fontSize: 10, textAlign: 'center', lineHeight: 14 },

  sectionHead:       { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 12 },

  prefCard:          { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prefCardLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  prefFlag:          { fontSize: 24 },
  prefName:          { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 2 },
  prefHighlight:     { color: '#6b7280', fontSize: 12 },
  prefRight:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prefAmountBadge:   { backgroundColor: 'rgba(34,197,94,0.14)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(34,197,94,0.28)' },
  prefAmount:        { color: '#4ade80', fontSize: 12, fontWeight: '800' },
  prefArrow:         { color: '#4ade80', fontSize: 22, fontWeight: '300' },

  programCard:       { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  programHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  programTitle:      { color: '#fff', fontWeight: '800', fontSize: 15, flex: 1 },
  amountBadge:       { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  amountBadgeText:   { color: '#4ade80', fontSize: 11, fontWeight: '800' },
  programDesc:       { color: '#d1d5db', fontSize: 13, lineHeight: 20, marginBottom: 10 },
  eligibilityBox:    { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12 },
  eligibilityLabel:  { color: '#6b7280', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  eligibilityText:   { color: '#9ca3af', fontSize: 13, lineHeight: 19 },

  notesCard:         { backgroundColor: 'rgba(245,158,11,0.10)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', marginBottom: 16 },
  notesIcon:         { color: '#fbbf24', fontWeight: '800', fontSize: 13, marginBottom: 6 },
  notesText:         { color: '#d1d5db', fontSize: 13, lineHeight: 20 },

  contactCard:       { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  contactLabel:      { color: '#6b7280', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  contactDetail:     { color: '#e5e7eb', fontSize: 13, lineHeight: 19 },

  card:              { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  amountCard:        { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' },
  cardLabel:         { color: '#9ca3af', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  amountText:        { color: '#4ade80', fontSize: 36, fontWeight: '900', marginBottom: 4 },
  amountSub:         { color: '#86efac', fontSize: 14 },
  notes:             { color: '#d1d5db', fontSize: 14, lineHeight: 22 },
  cardDisclaimer:    { color: '#4b5563', fontSize: 11, lineHeight: 16, marginTop: 12 },

  row:               { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowLabel:          { color: '#9ca3af', fontSize: 13 },
  rowValue:          { color: '#fff', fontSize: 13, fontWeight: '600' },

  stepRow:           { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  stepNum:           { color: '#e85d2f', fontSize: 13, fontWeight: '900', width: 18, marginTop: 1 },
  stepText:          { color: '#d1d5db', fontSize: 13, lineHeight: 20, flex: 1 },
  reqBullet:         { color: '#4ade80', fontSize: 13, fontWeight: '800', marginTop: 1 },

  hubTeaser:         { backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', marginBottom: 16 },
  hubTeaserTitle:    { color: '#4ade80', fontWeight: '800', fontSize: 13, marginBottom: 3 },
  hubTeaserSub:      { color: '#86efac', fontSize: 12 },

  disclaimer:        { color: '#6b7280', fontSize: 11, lineHeight: 17, textAlign: 'center', paddingHorizontal: 8, marginTop: 4 },
});
