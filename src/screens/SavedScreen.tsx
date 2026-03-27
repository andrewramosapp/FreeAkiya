import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, SafeAreaView, RefreshControl
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getSavedListings, Listing } from '../lib/api';
import { EmptyState } from './PlaceholderScreen';
import { useAuth } from '../../App';

const PH = 'https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png';

export default function SavedScreen() {
  const nav = useNavigation<any>();
  const { member } = useAuth();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'load' | 'refresh' = 'load') => {
    if (!member?.email) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (mode === 'load') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    try {
      const data = await getSavedListings();
      setItems((data?.listings || []) as Listing[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load saved listings');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [member?.email]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load('refresh'); }, [load]));

  if (!member?.email) {
    return (
      <SafeAreaView style={s.wrap}>
        <EmptyState title="Members only" subtitle="Sign in or join free to save homes and see them here." />
      </SafeAreaView>
    );
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#e85d2f" /><Text style={s.sub}>Loading saved listings…</Text></View>;
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.title}>Saved</Text>
        <Text style={s.err}>Couldn’t load saved listings</Text>
        <Text style={s.sub}>{error}</Text>
        <TouchableOpacity style={s.btn} onPress={() => load()}><Text style={s.btnText}>Retry</Text></TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.wrap}>
        <EmptyState
          title="No saved listings yet"
          subtitle="Save homes from the listing or detail screen and they’ll show up here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>Saved</Text>
        <Text style={s.sub}>{items.length} saved</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor="#e85d2f" />}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => nav.navigate('Listings', { screen: 'Listing', params: { slug: item.slug, listing: item, memberEmail: member.email } })}>
            <Image source={{ uri: item.images?.[0] || PH }} style={s.image} />
            <View style={s.body}>
              <Text style={s.price}>{item.price}</Text>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <Text style={s.meta}>{[item.prefecture, item.city].filter(Boolean).join(' · ')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0b0b0b' },
  center: { flex: 1, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 8, textAlign: 'center' },
  err: { color: '#f87171', fontSize: 16, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  btn: { marginTop: 16, backgroundColor: '#e85d2f', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  card: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  image: { width: 120, height: 110, backgroundColor: '#1f2937' },
  body: { flex: 1, padding: 12, justifyContent: 'center' },
  price: { color: '#e85d2f', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  name: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#9ca3af', fontSize: 12 },
});
