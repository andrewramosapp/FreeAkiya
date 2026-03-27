import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking,
  Image, Modal, FlatList
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { getAllListings, Listing } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';

const INITIAL_REGION: Region = {
  latitude: 36.2048,
  longitude: 138.2529,
  latitudeDelta: 22,
  longitudeDelta: 22,
};

const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';

type Cluster = {
  key: string;
  latitude: number;
  longitude: number;
  count: number;
  items: Listing[];
  representative: Listing;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getCellSize(region: Region) {
  const zoominess = Math.max(region.latitudeDelta, region.longitudeDelta);
  return clamp(zoominess / 12, 0.0025, 1.5);
}

function buildClusters(items: Listing[], region: Region) {
  const cellSize = getCellSize(region);
  const buckets = new Map<string, Listing[]>();

  for (const item of items) {
    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') continue;
    const latBucket = Math.floor(item.lat / cellSize);
    const lngBucket = Math.floor(item.lng / cellSize);
    const key = `${latBucket}:${lngBucket}`;
    const arr = buckets.get(key) || [];
    arr.push(item);
    buckets.set(key, arr);
  }

  return Array.from(buckets.entries()).map(([key, group]) => {
    const latitude = group.reduce((sum, item) => sum + (item.lat || 0), 0) / group.length;
    const longitude = group.reduce((sum, item) => sum + (item.lng || 0), 0) / group.length;
    return {
      key,
      latitude,
      longitude,
      count: group.length,
      items: group,
      representative: group[0],
    } satisfies Cluster;
  });
}

function getClusterRegion(cluster: Cluster, currentRegion: Region): Region {
  const lats = cluster.items.map((item) => item.lat || cluster.latitude);
  const lngs = cluster.items.map((item) => item.lng || cluster.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const spanLat = Math.max(maxLat - minLat, 0.0015);
  const spanLng = Math.max(maxLng - minLng, 0.0015);

  const latDelta = Math.min(currentRegion.latitudeDelta * 0.38, Math.max(spanLat * 2.4, 0.01));
  const lngDelta = Math.min(currentRegion.longitudeDelta * 0.38, Math.max(spanLng * 2.4, 0.01));

  return {
    latitude: cluster.latitude,
    longitude: cluster.longitude,
    latitudeDelta: clamp(latDelta, 0.006, 22),
    longitudeDelta: clamp(lngDelta, 0.006, 22),
  };
}

function clusterColor(count: number) {
  if (count >= 50) return '#b91c1c';
  if (count >= 20) return '#ea580c';
  if (count >= 8) return '#f59e0b';
  return '#e85d2f';
}

export default function MapScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const all = await getAllListings('price_asc', 8);
        const withCoords = all.filter((l) => typeof l.lat === 'number' && typeof l.lng === 'number');
        if (!mounted) return;
        setListings(withCoords);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load map listings');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, []);

  const pins = useMemo(() => listings.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number'), [listings]);
  const clusters = useMemo(() => buildClusters(pins, region), [pins, region]);
  const clusterCount = useMemo(() => clusters.filter((c) => c.count > 1).length, [clusters]);

  const zoomOutToJapan = useCallback(() => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 350);
  }, []);

  const handleClusterPress = useCallback((cluster: Cluster) => {
    const nextRegion = getClusterRegion(cluster, region);
    const nextClusters = buildClusters(cluster.items, nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 260);
    setRegion(nextRegion);

    const stillCollapsed = nextClusters.length === 1 && nextClusters[0].count === cluster.count;
    if (stillCollapsed || nextRegion.latitudeDelta <= 0.02 || nextRegion.longitudeDelta <= 0.02) {
      setSelectedCluster(cluster);
    }
  }, [region]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#e85d2f" /><Text style={styles.sub}>Loading map…</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.title}>Map</Text><Text style={styles.sub}>Couldn’t load map</Text><Text style={styles.err}>{error}</Text></View>;
  }

  return (
    <View style={styles.wrap}>
      {!member?.email && (
        <View style={styles.gateBanner}>
          <Text style={styles.gateBannerTitle}>Premium homes are visible on the map but locked until you upgrade.</Text>
          <Text style={styles.gateBannerText}>Join free to save listings. Upgrade for full premium access.</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={setRegion}
      >
        {clusters.map((cluster) => {
          if (cluster.count === 1) {
            const item = cluster.representative;
            const lockedPremium = item.isPremium && member?.tier !== 'premium';
            return (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.lat!, longitude: item.lng! }}
                pinColor={lockedPremium ? '#6b7280' : item.priceNum === 0 ? '#10b981' : item.isPremium ? '#e85d2f' : '#f59e0b'}
              >
                <Callout tooltip onPress={() => nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item, memberEmail: member?.email || null } })}>
                  <View style={styles.callout}>
                    <Image source={{ uri: item.images?.[0] || PH }} style={[styles.calloutImg, lockedPremium && { opacity: 0.65 }]} />
                    <Text style={styles.calloutPrice}>{item.price}</Text>
                    <Text style={styles.calloutTitle} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.calloutMeta}>{item.prefecture}{item.city ? ` · ${item.city}` : ''}</Text>
                    {lockedPremium ? <Text style={styles.lockedText}>Premium listing — upgrade to unlock</Text> : null}
                    <View style={styles.calloutBtns}>
                      <TouchableOpacity style={styles.smallBtn} onPress={() => nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item, memberEmail: member?.email || null } })}>
                        <Text style={styles.smallBtnText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.smallBtn, styles.mapBtn]} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.lat},${item.lng}`)}>
                        <Text style={styles.smallBtnText}>Maps</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          }

          return (
            <Marker
              key={cluster.key}
              coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
              onPress={() => handleClusterPress(cluster)}
            >
              <View style={[
                styles.clusterBubble,
                { backgroundColor: clusterColor(cluster.count) },
                cluster.count >= 10 && styles.clusterBubbleLarge,
                cluster.count >= 40 && styles.clusterBubbleXL,
              ]}>
                <Text style={styles.clusterCount}>{cluster.count}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.badge}>{pins.length} homes · {clusterCount} active clusters</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={zoomOutToJapan}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedCluster} transparent animationType="slide" onRequestClose={() => setSelectedCluster(null)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedCluster?.count || 0} homes in this cluster</Text>
              <TouchableOpacity onPress={() => setSelectedCluster(null)}><Text style={styles.sheetClose}>Close</Text></TouchableOpacity>
            </View>
            <FlatList
              data={selectedCluster?.items || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 18 }}
              renderItem={({ item }) => {
                const lockedPremium = item.isPremium && member?.tier !== 'premium';
                return (
                  <TouchableOpacity
                    style={styles.sheetRow}
                    onPress={() => {
                      setSelectedCluster(null);
                      nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item, memberEmail: member?.email || null } });
                    }}
                  >
                    <Image source={{ uri: item.images?.[0] || PH }} style={[styles.sheetImg, lockedPremium && { opacity: 0.65 }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sheetPrice}>{item.price}</Text>
                      <Text style={styles.sheetName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.sheetMeta}>{[item.prefecture, item.city].filter(Boolean).join(' · ')}</Text>
                      {lockedPremium ? <Text style={styles.lockedText}>Premium listing — locked</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b0b0b' },
  map: { flex: 1 },
  gateBanner: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 30, backgroundColor: 'rgba(232,93,47,0.10)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(232,93,47,0.2)' },
  gateBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 13, marginBottom: 4 },
  gateBannerText: { color: '#d1d5db', fontSize: 12 },
  topBar: {
    position: 'absolute', top: 130, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.85)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  title: { color: 'white', fontSize: 20, fontWeight: '800' },
  badge: { color: '#9ca3af', fontSize: 12, fontWeight: '700', marginTop: 3 },
  center: { flex: 1, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center' },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 10 },
  err: { color: '#f87171', fontSize: 13, marginTop: 8, paddingHorizontal: 20, textAlign: 'center' },
  resetBtn: { backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resetBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  clusterBubble: { minWidth: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'rgba(255,255,255,0.92)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  clusterBubbleLarge: { minWidth: 48, height: 48, borderRadius: 24 },
  clusterBubbleXL: { minWidth: 56, height: 56, borderRadius: 28 },
  clusterCount: { color: '#fff', fontSize: 14, fontWeight: '900' },
  callout: { width: 220, backgroundColor: '#111827', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  calloutImg: { width: '100%', height: 110, backgroundColor: '#1f2937' },
  calloutPrice: { color: '#e85d2f', fontSize: 18, fontWeight: '900', paddingHorizontal: 12, paddingTop: 10 },
  calloutTitle: { color: '#fff', fontSize: 13, fontWeight: '700', paddingHorizontal: 12, paddingTop: 4 },
  calloutMeta: { color: '#9ca3af', fontSize: 11, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 6 },
  lockedText: { color: '#fca5a5', fontSize: 11, fontWeight: '700', paddingHorizontal: 12, paddingBottom: 8 },
  calloutBtns: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  smallBtn: { flex: 1, backgroundColor: '#e85d2f', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  mapBtn: { backgroundColor: '#374151' },
  smallBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '62%', paddingHorizontal: 16, paddingTop: 14 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sheetClose: { color: '#e5e7eb', fontWeight: '700' },
  sheetRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  sheetImg: { width: 74, height: 74, borderRadius: 12, backgroundColor: '#1f2937' },
  sheetPrice: { color: '#e85d2f', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  sheetName: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  sheetMeta: { color: '#9ca3af', fontSize: 12 },
});
