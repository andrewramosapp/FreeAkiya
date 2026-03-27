import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking,
  Image, Modal, FlatList
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { getAllListings, Listing } from '../lib/api';
import { useNavigation } from '@react-navigation/native';

const INITIAL_REGION: Region = {
  latitude: 36.2048,
  longitude: 138.2529,
  latitudeDelta: 22,
  longitudeDelta: 22,
};

const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';

type MarkerLookup = Record<string, Listing>;

export default function MapScreen() {
  const nav = useNavigation<any>();
  const mapRef = useRef<MapView | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClusterItems, setSelectedClusterItems] = useState<Listing[] | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const all = await getAllListings('price_asc', 40);
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
  const markerLookup = useMemo<MarkerLookup>(() => Object.fromEntries(pins.map((item) => [item.id, item])), [pins]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#e85d2f" /><Text style={styles.sub}>Loading map…</Text></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.title}>Map</Text><Text style={styles.sub}>Couldn’t load map</Text><Text style={styles.err}>{error}</Text></View>;
  }

  return (
    <View style={styles.wrap}>
      <ClusteredMapView
        ref={mapRef as any}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        animationEnabled
        preserveClusterPressBehavior
        spiralEnabled
        clusterColor="#e85d2f"
        clusterTextColor="#ffffff"
        radius={46}
        extent={512}
        minPoints={2}
        renderCluster={(cluster: any) => {
          const pointCount = cluster.pointCount;
          return (
            <Marker coordinate={cluster.coordinate}>
              <View style={[
                styles.clusterBubble,
                pointCount >= 10 && styles.clusterBubbleLarge,
                pointCount >= 40 && styles.clusterBubbleXL,
              ]}>
                <Text style={styles.clusterCount}>{pointCount}</Text>
              </View>
            </Marker>
          );
        }}
        onClusterPress={(_cluster: any, markers?: any[]) => {
          const items = (markers || [])
            .map((marker: any) => marker?.id && markerLookup[String(marker.id)])
            .filter((item): item is Listing => !!item);

          if (items.length > 1) {
            setSelectedClusterItems(items);
          }
        }}
      >
        {pins.map((item) => (
          <Marker
            key={item.id}
            identifier={item.id}
            coordinate={{ latitude: item.lat!, longitude: item.lng! }}
            pinColor={item.priceNum === 0 ? '#10b981' : item.isPremium ? '#e85d2f' : '#f59e0b'}
            tracksViewChanges={false}
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
        ))}
      </ClusteredMapView>

      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.badge}>{pins.length} homes</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={() => mapRef.current?.animateToRegion(INITIAL_REGION, 350)}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedClusterItems?.length} transparent animationType="slide" onRequestClose={() => setSelectedClusterItems(null)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedClusterItems?.length || 0} homes in this cluster</Text>
              <TouchableOpacity onPress={() => setSelectedClusterItems(null)}><Text style={styles.sheetClose}>Close</Text></TouchableOpacity>
            </View>
            <FlatList
              data={selectedClusterItems || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 18 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sheetRow}
                  onPress={() => {
                    setSelectedClusterItems(null);
                    nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item } });
                  }}
                >
                  <Image source={{ uri: item.images?.[0] || PH }} style={styles.sheetImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetPrice}>{item.price}</Text>
                    <Text style={styles.sheetName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.sheetMeta}>{[item.prefecture, item.city].filter(Boolean).join(' · ')}</Text>
                  </View>
                </TouchableOpacity>
              )}
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
  topBar: {
    position: 'absolute', top: 56, left: 16, right: 16,
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
  clusterBubble: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
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
  clusterBubbleLarge: { minWidth: 48, height: 48, borderRadius: 24 },
  clusterBubbleXL: { minWidth: 56, height: 56, borderRadius: 28 },
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
