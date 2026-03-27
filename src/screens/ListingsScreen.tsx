import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, SafeAreaView, StatusBar, ScrollView, Dimensions
} from 'react-native';
import { getListingsPage, Listing } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import PriceRangeSlider from '../components/PriceRangeSlider';

const REGIONS = ['All', 'Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu'];
const CONDITIONS = [
  { value: 'all', label: 'Any condition' },
  { value: 'move_in_ready', label: 'Move-in ready' },
  { value: 'renovation_needed', label: 'Needs work' },
];
const MAX_PRICE = 200000;
const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';
const CARD_W = (Dimensions.get('window').width - 22) / 2;

function cleanValue(v?: string | null) {
  if (!v || v === 'NA' || v === 'Unknown') return null;
  return v;
}

function Badge({ text, tone = 'default' }: { text: string; tone?: 'default' | 'green' | 'blue' | 'orange' | 'purple' }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: 'rgba(255,255,255,0.1)' },
    green: { bg: 'rgba(34,197,94,0.14)', color: '#86efac', border: 'rgba(34,197,94,0.28)' },
    blue: { bg: 'rgba(59,130,246,0.14)', color: '#93c5fd', border: 'rgba(59,130,246,0.28)' },
    orange: { bg: 'rgba(232,93,47,0.14)', color: '#fdba74', border: 'rgba(232,93,47,0.28)' },
    purple: { bg: 'rgba(168,85,247,0.14)', color: '#d8b4fe', border: 'rgba(168,85,247,0.28)' },
  }[tone];
  return <View style={[s.badge, { backgroundColor: tones.bg, borderColor: tones.border }]}><Text style={[s.badgeText, { color: tones.color }]}>{text}</Text></View>;
}

export default function ListingsScreen() {
  const nav = useNavigation<any>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('All');
  const [photosOnly, setPhotosOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [condition, setCondition] = useState('all');
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  async function loadFirstPage() {
    setLoading(true);
    setError(null);
    try {
      const data = await getListingsPage(0, sort);
      const items = (data?.listings || []) as Listing[];
      setListings(items);
      setPage(1);
      setHasMore(!!data?.hasMore);
    } catch (e: any) {
      setListings([]);
      setError(e?.message || 'Unknown load error');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await getListingsPage(page, sort);
      const items = (data?.listings || []) as Listing[];
      setListings(prev => [...prev, ...items]);
      setPage(prev => prev + 1);
      setHasMore(!!data?.hasMore);
    } catch (e: any) {
      setError(e?.message || 'Load more failed');
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => { loadFirstPage(); }, [sort]);

  const filtered = useMemo(() => listings.filter((l) => {
    if (region !== 'All' && l.region !== region) return false;
    if (photosOnly && (!l.images || l.images.length === 0)) return false;
    if (premiumOnly && !l.isPremium) return false;
    if (l.priceNum < minPrice || l.priceNum > maxPrice) return false;
    if (condition === 'move_in_ready' && l.condition !== 'move_in_ready') return false;
    if (condition === 'renovation_needed' && l.condition !== 'renovation_needed') return false;
    return true;
  }), [listings, region, photosOnly, premiumOnly, minPrice, maxPrice, condition]);

  const renderItem = ({ item }: { item: Listing }) => {
    const img = item.images?.[0] || PH;
    const sizeText = cleanValue(item.size);
    const stationText = item.stationWalkMin ? `${item.stationWalkMin} min to station` : null;
    return (
      <TouchableOpacity style={s.card} onPress={() => nav.navigate('Listing', { slug: item.slug, listing: item })}>
        <View style={s.imgBox}>
          <Image source={{ uri: img }} style={s.img} resizeMode="cover" />
          <View style={s.priceTag}><Text style={s.priceTagText}>{item.price}</Text></View>
          {item.isPremium && <View style={s.lockTag}><Text style={s.lockTagText}>PREMIUM</Text></View>}
          {item.isFeatured && <View style={s.featureTag}><Text style={s.featureTagText}>⭐</Text></View>}
        </View>
        <View style={s.body}>
          <Text style={s.pref}>{item.prefecture}{item.city ? ` · ${item.city}` : ''}</Text>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
          <Text style={s.spec} numberOfLines={2}>
            {[item.beds ? `${item.beds} bed` : null, sizeText, stationText].filter(Boolean).join(' · ')}
          </Text>
          <View style={s.badgesRow}>
            {item.subsidyAvailable ? <Badge text="Subsidy" tone="green" /> : null}
            {item.condition === 'move_in_ready' ? <Badge text="Move-in" tone="blue" /> : null}
            {item.internetType === 'fiber' ? <Badge text="Fiber" tone="purple" /> : null}
            {(item.disasterScore || 0) >= 4 ? <Badge text="Low risk" tone="orange" /> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View>
          <Text style={s.logo}>CheapAkiya</Text>
          <Text style={s.subhead}>{loading ? 'Loading…' : `${filtered.length} results`}</Text>
        </View>
        <View style={s.headerRight}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {[
              ['newest', 'Newest'],
              ['price_asc', 'Cheapest'],
              ['price_desc', 'Priciest'],
            ].map(([value, label]) => (
              <TouchableOpacity key={value} onPress={() => setSort(value as any)} style={[s.sortPill, sort === value && s.sortPillActive]}>
                <Text style={[s.sortPillText, sort === value && s.sortPillTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.filterToggle} onPress={() => setFiltersOpen(!filtersOpen)}>
            <Text style={s.filterToggleText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filtersOpen && (
        <ScrollView style={s.filtersPanel} contentContainerStyle={{ paddingBottom: 12 }}>
          <Text style={s.panelLabel}>Price</Text>
          <PriceRangeSlider min={0} max={MAX_PRICE} minVal={minPrice} maxVal={maxPrice} onChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi); }} />

          <Text style={s.panelLabel}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.controlsRowTight}>
            {REGIONS.map(r => {
              const active = region === r;
              return <TouchableOpacity key={r} onPress={() => setRegion(r)} style={[s.filterPill, active && s.filterPillActive]}><Text style={[s.filterPillText, active && s.filterPillTextActive]}>{r}</Text></TouchableOpacity>;
            })}
          </ScrollView>

          <Text style={s.panelLabel}>Condition</Text>
          <View style={s.flexWrapRow}>
            {CONDITIONS.map(c => {
              const active = condition === c.value;
              return <TouchableOpacity key={c.value} onPress={() => setCondition(c.value)} style={[s.filterPill, active && s.filterPillActive]}><Text style={[s.filterPillText, active && s.filterPillTextActive]}>{c.label}</Text></TouchableOpacity>;
            })}
          </View>

          <Text style={s.panelLabel}>Other</Text>
          <View style={s.flexWrapRow}>
            <TouchableOpacity onPress={() => setPhotosOnly(!photosOnly)} style={[s.filterPill, photosOnly && s.filterPillActive]}><Text style={[s.filterPillText, photosOnly && s.filterPillTextActive]}>Photos</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setPremiumOnly(!premiumOnly)} style={[s.filterPill, premiumOnly && s.filterPillActive]}><Text style={[s.filterPillText, premiumOnly && s.filterPillTextActive]}>Premium</Text></TouchableOpacity>
          </View>

          <View style={s.actionsRow}>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => { setRegion('All'); setPhotosOnly(false); setPremiumOnly(false); setMinPrice(0); setMaxPrice(MAX_PRICE); setCondition('all'); }}>
              <Text style={s.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={() => setFiltersOpen(false)}>
              <Text style={s.primaryBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {loading ? (
        <View style={s.stateWrap}><ActivityIndicator color="#e85d2f" /><Text style={s.stateText}>Loading listings…</Text></View>
      ) : error ? (
        <View style={s.stateWrap}>
          <Text style={s.stateTitle}>Couldn’t load listings</Text>
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={loadFirstPage}><Text style={s.retryBtnText}>Retry</Text></TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.stateWrap}>
          <Text style={s.stateTitle}>No listings showing</Text>
          <Text style={s.stateText}>Your current filters returned zero results.</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => { setRegion('All'); setPhotosOnly(false); setPremiumOnly(false); setMinPrice(0); setMaxPrice(MAX_PRICE); setCondition('all'); }}><Text style={s.retryBtnText}>Clear filters</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={{ padding: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.45}
          ListFooterComponent={
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              {loadingMore ? <ActivityIndicator color="#e85d2f" /> : hasMore ? (
                <TouchableOpacity style={s.loadMoreBtn} onPress={loadMore}><Text style={s.loadMoreBtnText}>Load more</Text></TouchableOpacity>
              ) : <Text style={s.endText}>End of loaded results</Text>}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 10 },
  headerRight: { gap: 10 },
  logo: { color: '#e85d2f', fontSize: 22, fontWeight: '900' },
  subhead: { color: '#6b7280', fontSize: 11, marginTop: 3 },
  filterToggle: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  filterToggleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  filtersPanel: { maxHeight: 360, marginHorizontal: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 },
  panelLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 6, textTransform: 'uppercase' },
  controlsRowTight: { gap: 8, paddingVertical: 4 },
  flexWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)' },
  sortPillActive: { backgroundColor: '#e85d2f' },
  sortPillText: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  sortPillTextActive: { color: '#fff' },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterPillActive: { backgroundColor: '#e85d2f', borderColor: '#e85d2f' },
  filterPillText: { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  filterPillTextActive: { color: '#fff' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#fff', fontWeight: '700' },
  primaryBtn: { flex: 1, backgroundColor: '#e85d2f', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  row: { justifyContent: 'space-between' },
  card: { width: CARD_W, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  imgBox: { position: 'relative', height: 142 },
  img: { width: '100%', height: '100%' },
  priceTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.82)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  priceTagText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  lockTag: { position: 'absolute', top: 8, right: 8, backgroundColor: '#e85d2f', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
  lockTagText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  featureTag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
  featureTagText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },
  body: { padding: 10 },
  pref: { color: '#6b7280', fontSize: 10, marginBottom: 4 },
  name: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 17, marginBottom: 5, minHeight: 34 },
  spec: { color: '#9ca3af', fontSize: 10, marginBottom: 8, lineHeight: 14, minHeight: 28 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  stateWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  stateTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  stateText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 10 },
  retryBtn: { marginTop: 16, backgroundColor: '#e85d2f', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  loadMoreBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loadMoreBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  endText: { color: '#6b7280', textAlign: 'center', fontSize: 12 },
});
