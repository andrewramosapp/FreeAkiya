import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Dimensions, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Listing, getSavedListingIds, setSavedListing } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import PriceRangeSlider from '../components/PriceRangeSlider';
import { useAuth } from '../../App';

const API_BASE = 'https://cheapakiya.com';
const REGIONS = ['All', 'Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu'];
const CONDITIONS = [
  { value: 'all', label: 'Any condition' },
  { value: 'move_in_ready', label: 'Move-in ready' },
  { value: 'renovation_needed', label: 'Needs work' },
];
const MAX_PRICE = 500000;
const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';
const CARD_W = (Dimensions.get('window').width - 22) / 2;

function Badge({ text, tone = 'default' }: { text: string; tone?: 'default' | 'green' | 'blue' | 'orange' | 'purple' }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: 'rgba(255,255,255,0.1)' },
    green:   { bg: 'rgba(34,197,94,0.14)',   color: '#86efac', border: 'rgba(34,197,94,0.28)' },
    blue:    { bg: 'rgba(59,130,246,0.14)',   color: '#93c5fd', border: 'rgba(59,130,246,0.28)' },
    orange:  { bg: 'rgba(232,93,47,0.14)',    color: '#fdba74', border: 'rgba(232,93,47,0.28)' },
    purple:  { bg: 'rgba(168,85,247,0.14)',   color: '#d8b4fe', border: 'rgba(168,85,247,0.28)' },
  }[tone];
  return (
    <View style={[s.badge, { backgroundColor: tones.bg, borderColor: tones.border }]}>
      <Text style={[s.badgeText, { color: tones.color }]}>{text}</Text>
    </View>
  );
}

function cleanValue(v?: string | null) {
  if (!v || v === 'NA' || v === 'Unknown') return null;
  return v;
}

function ListingCard({ item, nav, member, savedIds, savingId, toggleSave }: {
  item: Listing;
  nav: any;
  member: any;
  savedIds: string[];
  savingId: string | null;
  toggleSave: (item: Listing) => void;
}) {
  const img = item.images?.[0] || PH;
  const sizeText = cleanValue(item.size);
  const stationText = item.stationWalkMin ? `${item.stationWalkMin} min to station` : null;
  const isSaved = savedIds.includes(item.id);
  const isSaving = savingId === item.id;
  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => nav.navigate('Listing', { slug: item.slug, listing: item, memberEmail: member?.email || null })}
      activeOpacity={0.85}
    >
      <View style={s.imgBox}>
        <Image key={img} source={{ uri: img }} style={s.img} resizeMode="cover" />
        <View style={s.priceTag}><Text style={s.priceTagText}>{item.price}</Text></View>
        <TouchableOpacity style={s.savePill} onPress={(e) => { e.stopPropagation?.(); toggleSave(item); }}>
          <Text style={s.savePillText}>{isSaving ? '…' : isSaved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        {item.isPremium && (
          <View style={s.lockTag}>
            <Text style={s.lockTagText}>{member?.tier === 'premium' ? '⭐ PREMIUM' : '🔒 PREMIUM'}</Text>
          </View>
        )}
      </View>
      <View style={s.body}>
        <Text style={s.pref}>{item.prefecture}{item.city ? ` · ${item.city}` : ''}</Text>
        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        <Text style={s.spec} numberOfLines={2}>
          {[item.beds ? `${item.beds} bed` : null, sizeText, stationText].filter(Boolean).join(' · ') || '—'}
        </Text>
        <View style={s.badgesRow}>
          {item.subsidyAvailable ? <Badge text="Subsidy" tone="green" /> : null}
          {item.condition === 'move_in_ready' ? <Badge text="Move-in" tone="blue" /> : null}
          {item.internetType === 'fiber' ? <Badge text="Fiber" tone="purple" /> : null}
          {(item.disasterScore || 0) >= 4 ? <Badge text="🛡 Safe area" tone="green" /> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Skeleton card shown while loading
function SkeletonCard() {
  return (
    <View style={[s.card, { opacity: 0.4 }]}>
      <View style={[s.imgBox, { backgroundColor: '#1f2937' }]} />
      <View style={s.body}>
        <View style={{ height: 10, backgroundColor: '#374151', borderRadius: 4, marginBottom: 8, width: '60%' }} />
        <View style={{ height: 13, backgroundColor: '#374151', borderRadius: 4, marginBottom: 6, width: '90%' }} />
        <View style={{ height: 13, backgroundColor: '#374151', borderRadius: 4, width: '75%' }} />
      </View>
    </View>
  );
}

export default function ListingsScreen() {
  const nav = useNavigation<any>();
  const { member, setShowScrollTest } = useAuth();
  const insets = useSafeAreaInsets();

  // All listings — loaded once, cached
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [region, setRegion] = useState('All');
  const [photosOnly, setPhotosOnly] = useState(true);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [subsidyOnly, setSubsidyOnly] = useState(false);
  const [condition, setCondition] = useState('all');
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Saved state
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState(1);

  async function fetchAll(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      // Fetch first 5 pages in parallel for fast initial load
      const requests = [0,1,2,3,4].map(p => fetch(`${API_BASE}/api/listings-page?page=${p}&sort=newest`).then(r => r.json()));
      const results = await Promise.all(requests);
      const allItems = results.flatMap(d => (d?.listings || []) as Listing[]);
      const firstResult = results[0];
      setAllListings(allItems);
      setTotalCount(firstResult?.total ?? null);
      setHasMore(!!results[4]?.hasMore);
      setPage(5);
      if (member?.email) {
        try {
          const ids = await getSavedListingIds(member.email);
          setSavedIds(ids);
        } catch { /* non-critical */ }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let currentPage = page;
      let newItems: Listing[] = [];
      let more: boolean = hasMore;
      // Fetch up to 5 pages at once to ensure enough visible results
      for (let i = 0; i < 5 && more; i++) {
        const r = await fetch(`${API_BASE}/api/listings-page?page=${currentPage}&sort=newest`);
        const d = await r.json();
        const items = (d?.listings || []) as Listing[];
        newItems = [...newItems, ...items];
        more = !!d?.hasMore;
        currentPage++;
      }
      setAllListings(prev => [...prev, ...newItems]);
      setHasMore(more);
      setPage(currentPage);
    } catch { /* silently fail */ } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => { fetchAll(); }, [member?.email]);

  // All filtering + sorting in memory — instant, no network calls
  const filtered = useMemo(() => {
    let list = allListings;
    if (region !== 'All') list = list.filter(l => l.region === region);
    if (photosOnly) list = list.filter(l => l.images?.length > 0 && !l.images[0].includes('OLD%20HOUSES'));
    if (premiumOnly) list = list.filter(l => l.isPremium);
    if (freeOnly) list = list.filter(l => !l.isPremium);
    if (subsidyOnly) list = list.filter(l => l.subsidyAvailable);
    if (condition === 'move_in_ready') list = list.filter(l => l.condition === 'move_in_ready');
    if (condition === 'renovation_needed') list = list.filter(l => l.condition !== 'move_in_ready');
    list = list.filter(l => l.priceNum >= minPrice && l.priceNum <= maxPrice);

    // Sort
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.priceNum - b.priceNum);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.priceNum - a.priceNum);
    // 'newest' = default API order (already sorted by scraped_at desc)

    return list;
  }, [allListings, region, photosOnly, premiumOnly, subsidyOnly, condition, sort, minPrice, maxPrice]);

  const resetFilters = useCallback(() => {
    setRegion('All');
    setPhotosOnly(true);
    setPremiumOnly(false);
    setFreeOnly(false);
    setSubsidyOnly(false);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setCondition('all');
    setVisibleCount(50);
  }, []);

  async function toggleSave(item: Listing) {
    if (!member?.email) {
      Alert.alert('Members only', 'Join free or sign in to save listings.');
      return;
    }
    try {
      setSavingId(item.id);
      const isSaved = savedIds.includes(item.id);
      await setSavedListing(item.id, !isSaved, member.email);
      setSavedIds(prev => isSaved ? prev.filter(id => id !== item.id) : [...prev, item.id]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Try again');
    } finally {
      setSavingId(null);
    }
  }

  const renderItem = useCallback(({ item }: { item: Listing }) => {
    const img = item.images?.[0] || PH;
    const sizeText = cleanValue(item.size);
    const stationText = item.stationWalkMin ? `${item.stationWalkMin} min to station` : null;
    const isSaved = savedIds.includes(item.id);
    const isSaving = savingId === item.id;
    const lockedPremium = false; // Gate only at detail screen, not in the list

    return (
      <TouchableOpacity
        style={[s.card, lockedPremium && s.cardLocked]}
        onPress={() => nav.navigate('Listing', { slug: item.slug, listing: item, memberEmail: member?.email || null })}
        activeOpacity={0.85}
      >
        <View style={s.imgBox}>
          <Image key={img} source={{ uri: img }} style={[s.img, lockedPremium && s.imgLocked]} resizeMode="cover" />
          <View style={s.priceTag}><Text style={s.priceTagText}>{item.price}</Text></View>
          <TouchableOpacity style={s.savePill} onPress={(e) => { e.stopPropagation?.(); toggleSave(item); }}>
            <Text style={s.savePillText}>{isSaving ? '…' : isSaved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
          {item.isPremium && (
            <View style={s.lockTag}>
              <Text style={s.lockTagText}>{member?.tier === 'premium' ? '⭐ PREMIUM' : '🔒 PREMIUM'}</Text>
            </View>
          )}
          {lockedPremium && (
            <View style={s.lockOverlay}>
              <Text style={s.lockOverlayText}>Premium</Text>
            </View>
          )}
        </View>
        <View style={s.body}>
          <Text style={s.pref}>{item.prefecture}{item.city ? ` · ${item.city}` : ''}</Text>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
          <Text style={s.spec} numberOfLines={2}>
            {lockedPremium ? 'Upgrade to unlock' : [item.beds ? `${item.beds} bed` : null, sizeText, stationText].filter(Boolean).join(' · ') || '—'}
          </Text>
          <View style={s.badgesRow}>
            {!lockedPremium && item.subsidyAvailable ? <Badge text="Subsidy" tone="green" /> : null}
            {!lockedPremium && item.condition === 'move_in_ready' ? <Badge text="Move-in" tone="blue" /> : null}
            {!lockedPremium && item.internetType === 'fiber' ? <Badge text="Fiber" tone="purple" /> : null}
            {!lockedPremium && (item.disasterScore || 0) >= 4 ? <Badge text="🛡 Safe area" tone="green" /> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [savedIds, savingId, member]);

  const activeFilterCount = [
    region !== 'All',
    !photosOnly,
    premiumOnly,
    freeOnly,
    subsidyOnly,
    condition !== 'all',
    minPrice > 0 || maxPrice < MAX_PRICE,
  ].filter(Boolean).length;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.logo}>CheapAkiya</Text>
          <Text style={s.subhead}>
            {totalCount != null ? `${totalCount.toLocaleString()} homes in Japan` : 'Loading…'}
            {member ? ` · ${member.tier}` : ''}
          </Text>
        </View>
        <View style={s.headerRight}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([['newest', 'Newest'], ['price_asc', 'Cheapest'], ['price_desc', 'Priciest']] as const).map(([value, label]) => (
              <TouchableOpacity key={value} onPress={() => setSort(value)} style={[s.sortPill, sort === value && s.sortPillActive]}>
                <Text style={[s.sortPillText, sort === value && s.sortPillTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[s.filterToggle, activeFilterCount > 0 && s.filterToggleActive]}
            onPress={() => setFiltersOpen(v => !v)}
          >
            <Text style={s.filterToggleText}>
              {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Subsidy banner — shown when subsidy filter is active */}
      {subsidyOnly && !filtersOpen && (
        <TouchableOpacity
          style={s.subsidyBanner}
          onPress={() => nav.navigate('Subsidy', { listing: null, prefectureHub: true })}
          activeOpacity={0.85}
        >
          <View style={s.subsidyBannerLeft}>
            <Text style={s.subsidyBannerTitle}>🏛 Japan pays you to move there</Text>
            <Text style={s.subsidyBannerText}>Grants up to ¥3M across 8 prefectures · Foreign buyers eligible · Tap to explore →</Text>
          </View>
          <Text style={s.subsidyBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Gate banner for guests */}
      {!member?.email && !filtersOpen && (
        <View style={s.gateBanner}>
          <Text style={s.gateBannerTitle}>Join free to save listings.</Text>
          <Text style={s.gateBannerText}>Premium listings are visible but locked until you upgrade.</Text>
        </View>
      )}

      {/* Filter panel */}
      {filtersOpen && (
        <View style={s.filtersPanel}>
          <Text style={s.panelLabel}>Price</Text>
          <PriceRangeSlider min={0} max={MAX_PRICE} minVal={minPrice} maxVal={maxPrice} onChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi); }} />

          <Text style={s.panelLabel}>Region</Text>
          <View style={s.flexWrapRow}>
            {REGIONS.map(r => (
              <TouchableOpacity key={r} onPress={() => setRegion(r)} style={[s.filterPill, region === r && s.filterPillActive]}>
                <Text style={[s.filterPillText, region === r && s.filterPillTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.panelLabel}>Condition</Text>
          <View style={s.flexWrapRow}>
            {CONDITIONS.map(c => (
              <TouchableOpacity key={c.value} onPress={() => setCondition(c.value)} style={[s.filterPill, condition === c.value && s.filterPillActive]}>
                <Text style={[s.filterPillText, condition === c.value && s.filterPillTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.panelLabel}>Other</Text>
          <View style={s.flexWrapRow}>
            <TouchableOpacity onPress={() => setPhotosOnly(v => !v)} style={[s.filterPill, photosOnly && s.filterPillActive]}>
              <Text style={[s.filterPillText, photosOnly && s.filterPillTextActive]}>📷 Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSubsidyOnly(v => !v)} style={[s.filterPill, subsidyOnly && s.filterPillActive]}>
              <Text style={[s.filterPillText, subsidyOnly && s.filterPillTextActive]}>🏛 Subsidy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setFreeOnly(v => !v); setPremiumOnly(false); }} style={[s.filterPill, freeOnly && s.filterPillActive]}>
              <Text style={[s.filterPillText, freeOnly && s.filterPillTextActive]}>🆓 Free only</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setPremiumOnly(v => !v); setFreeOnly(false); }} style={[s.filterPill, premiumOnly && s.filterPillActive]}>
              <Text style={[s.filterPillText, premiumOnly && s.filterPillTextActive]}>⭐ Premium</Text>
            </TouchableOpacity>
          </View>

          <View style={s.actionsRow}>
            <TouchableOpacity style={s.secondaryBtn} onPress={resetFilters}>
              <Text style={s.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={() => setFiltersOpen(false)}>
              <Text style={s.primaryBtnText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        // Skeleton loading state
        <FlatList
          data={Array(8).fill(null)}
          keyExtractor={(_, i) => `sk-${i}`}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={{ padding: 8 }}
          renderItem={() => <SkeletonCard />}
          scrollEnabled={false}
        />
      ) : error ? (
        <View style={s.stateWrap}>
          <Text style={s.stateTitle}>Couldn't load listings</Text>
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchAll()}><Text style={s.retryBtnText}>Retry</Text></TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.stateWrap}>
          <Text style={s.stateTitle}>No results</Text>
          <Text style={s.stateText}>No homes match your current filters.</Text>
          <TouchableOpacity style={s.retryBtn} onPress={resetFilters}><Text style={s.retryBtnText}>Clear filters</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setVisibleCount(50); fetchAll(true); }} tintColor="#e85d2f" />}
        >
          {filtered.slice(0, visibleCount).map((item, index, arr) => {
            if (index % 2 !== 0) return null;
            const next = arr[index + 1];
            return (
              <View key={item.id} style={s.row}>
                <ListingCard item={item} nav={nav} member={member} savedIds={savedIds} savingId={savingId} toggleSave={toggleSave} />
                {next
                  ? <ListingCard item={next} nav={nav} member={member} savedIds={savedIds} savingId={savingId} toggleSave={toggleSave} />
                  : <View style={{ width: CARD_W }} />}
              </View>
            );
          })}
          <View style={{ paddingVertical: 14, alignItems: 'center' }}>
            {visibleCount < filtered.length ? (
              <TouchableOpacity style={s.retryBtn} onPress={() => setVisibleCount(v => v + 50)}>
                <Text style={s.retryBtnText}>Show more listings</Text>
              </TouchableOpacity>
            ) : hasMore ? (
              <TouchableOpacity style={s.retryBtn} onPress={loadMore} disabled={loadingMore}>
                <Text style={s.retryBtnText}>{loadingMore ? 'Loading…' : 'Load more listings'}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.endText}>{filtered.length.toLocaleString()} loaded</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0a' },
  header:             { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 10 },
  headerRight:        { gap: 10 },
  logo:               { color: '#e85d2f', fontSize: 22, fontWeight: '900' },
  subhead:            { color: '#6b7280', fontSize: 11, marginTop: 3 },
  subsidyBanner:      { marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(34,197,94,0.10)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.28)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subsidyBannerLeft:  { flex: 1, marginRight: 8 },
  subsidyBannerTitle: { color: '#4ade80', fontWeight: '800', fontSize: 13, marginBottom: 3 },
  subsidyBannerText:  { color: '#86efac', fontSize: 11, lineHeight: 16 },
  subsidyBannerArrow: { color: '#4ade80', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  gateBanner:         { marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(232,93,47,0.10)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(232,93,47,0.25)' },
  gateBannerTitle:    { color: '#fff', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  gateBannerText:     { color: '#d1d5db', fontSize: 12, lineHeight: 18 },
  filterToggle:       { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  filterToggleActive: { backgroundColor: '#e85d2f' },
  filterToggleText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  filtersPanel:       { marginHorizontal: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 },
  panelLabel:         { color: '#9ca3af', fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 6, textTransform: 'uppercase' },
  flexWrapRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortPill:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)' },
  sortPillActive:     { backgroundColor: '#e85d2f' },
  sortPillText:       { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  sortPillTextActive: { color: '#fff' },
  filterPill:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterPillActive:   { backgroundColor: '#e85d2f', borderColor: '#e85d2f' },
  filterPillText:     { color: '#9ca3af', fontSize: 12, fontWeight: '600' },
  filterPillTextActive: { color: '#fff' },
  actionsRow:         { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 10 },
  secondaryBtn:       { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText:   { color: '#fff', fontWeight: '700' },
  primaryBtn:         { flex: 1, backgroundColor: '#e85d2f', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  row:                { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  card:               { width: CARD_W, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardLocked:         { borderColor: 'rgba(232,93,47,0.28)' },
  imgBox:             { position: 'relative', height: 142 },
  img:                { width: '100%', height: '100%' },
  imgLocked:          { opacity: 0.65 },
  lockOverlay:        { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' },
  lockOverlayText:    { color: '#fff', fontWeight: '900', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  priceTag:           { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.82)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  priceTagText:       { color: '#fff', fontWeight: '900', fontSize: 12 },
  savePill:           { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.78)', borderRadius: 999, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  savePillText:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  lockTag:            { position: 'absolute', top: 8, left: 8, backgroundColor: '#e85d2f', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
  lockTagText:        { color: '#fff', fontSize: 9, fontWeight: '800' },
  body:               { padding: 10 },
  pref:               { color: '#6b7280', fontSize: 10, marginBottom: 4 },
  name:               { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 17, marginBottom: 5, minHeight: 34 },
  spec:               { color: '#9ca3af', fontSize: 10, marginBottom: 8, lineHeight: 14, minHeight: 28 },
  badgesRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge:              { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  badgeText:          { fontSize: 10, fontWeight: '700' },
  stateWrap:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  stateTitle:         { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  stateText:          { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 10 },
  retryBtn:           { marginTop: 16, backgroundColor: '#e85d2f', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  retryBtnText:       { color: '#fff', fontWeight: '700' },
  endText:            { color: '#4b5563', textAlign: 'center', fontSize: 12 },
});
