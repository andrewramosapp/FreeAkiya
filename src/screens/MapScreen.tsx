import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Image } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { getListingsPage, Listing } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

const INITIAL_REGION: Region = {
  latitude: 36.2048,
  longitude: 138.2529,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';
const CELL = 0.22;

type Cluster = {
  key: string;
  latitude: number;
  longitude: number;
  count: number;
  items: Listing[];
  representative: Listing;
};

function buildClusters(items: Listing[]) {
  const buckets = new Map<string, Listing[]>();

  for (const item of items) {
    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') continue;
    const latBucket = Math.round(item.lat / CELL);
    const lngBucket = Math.round(item.lng / CELL);
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

export default function MapScreen() {
  const nav = useNavigation<any>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPages() {
      setLoading(true);
      setError(null);
      try {
        const pages = await Promise.all([0, 1, 2, 3, 4].map((p) => getListingsPage(p, 'price_asc')));
        const all = pages.flatMap((d) => (d?.listings || []) as Listing[]).filter(l => typeof l.lat === 'number' && typeof l.lng === 'number');
        if (!mounted) return;
        const unique = Array.from(new Map(all.map(l => [l.id, l])).values());
        setListings(unique);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load map listings');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPages();
    return () => { mounted = false; };
  }, []);

  const pins = useMemo(() => listings.filter(l => typeof l.lat === 'number' && typeof l.lng === 'number'), [listings]);
  const clusters = useMemo(() => buildClusters(pins), [pins]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#e85d2f" /><Text style={styles.sub}>Loading map…</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.title}>Map</Text><Text style={styles.sub}>Couldn’t load map</Text><Text style={styles.err}>{error}</Text></View>;
  }

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map} initialRegion={INITIAL_REGION}>
        {clusters.map((cluster) => {
          if (cluster.count === 1) {
            const item = cluster.representative;
            return (
              <Marker
                key={item.id}
                coordinate={{ latitude: item.lat!, longitude: item.lng! }}
                pinColor={item.priceNum === 0 ? '#10b981' : item.isPremium ? '#e85d2f' : '#f59e0b'}
              >
                <Callout tooltip onPress={() => nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item } })}>
                  <View style={styles.callout}>
                    <Image source={{ uri: item.images?.[0] || PH }} style={styles.calloutImg} />
                    <Text style={styles.calloutPrice}>{item.price}</Text>
                    <Text style={styles.calloutTitle} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.calloutMeta}>{item.prefecture}{item.city ? ` · ${item.city}` : ''}</Text>
                    <View style={styles.calloutBtns}>
                      <TouchableOpacity style={styles.smallBtn} onPress={() => nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item } })}>
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
              onPress={() => {
                const first = cluster.representative;
                nav.navigate('Listings', { screen: 'Listing', params: { slug: first.slug, listing: first } });
              }}
            >
              <View style={styles.clusterBubble}>
                <Text style={styles.clusterCount}>{cluster.count}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topBar}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.badge}>{pins.length} homes · {clusters.filter(c => c.count > 1).length} clusters</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b0b0b' },
  map: { flex: 1 },
  topBar: {
    position: 'absolute', top: 56, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.85)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  title: { color: 'white', fontSize: 20, fontWeight: '800' },
  badge: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center' },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 10 },
  err: { color: '#f87171', fontSize: 13, marginTop: 8, paddingHorizontal: 20, textAlign: 'center' },
  clusterBubble: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e85d2f',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  clusterCount: { color: '#fff', fontSize: 14, fontWeight: '900' },
  callout: { width: 220, backgroundColor: '#111827', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  calloutImg: { width: '100%', height: 110, backgroundColor: '#1f2937' },
  calloutPrice: { color: '#e85d2f', fontSize: 18, fontWeight: '900', paddingHorizontal: 12, paddingTop: 10 },
  calloutTitle: { color: '#fff', fontSize: 13, fontWeight: '700', paddingHorizontal: 12, paddingTop: 4 },
  calloutMeta: { color: '#9ca3af', fontSize: 11, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 10 },
  calloutBtns: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  smallBtn: { flex: 1, backgroundColor: '#e85d2f', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  mapBtn: { backgroundColor: '#374151' },
  smallBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
