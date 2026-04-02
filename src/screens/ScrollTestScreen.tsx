import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const API_BASE = 'https://cheapakiya.com';

export default function ScrollTestScreen({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log('[ScrollTest]', msg);
    setLog(prev => [`${new Date().toISOString().slice(11,19)}: ${msg}`, ...prev.slice(0, 20)]);
  };

  useEffect(() => {
    addLog('Fetching listings...');
    fetch(`${API_BASE}/api/listings-page?page=0&sort=newest`)
      .then(r => r.json())
      .then(d => {
        const listings = d?.listings || [];
        setItems(listings.slice(0, 50));
        addLog(`Loaded ${listings.length} listings, showing 50`);
      })
      .catch(e => addLog(`Error: ${e.message}`));
  }, []);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Scroll Diagnostic</Text>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Text style={s.closeText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.logHeader}>Logs:</Text>
      {log.slice(0, 3).map((l, i) => (
        <Text key={i} style={s.logText}>{l}</Text>
      ))}
      <Text style={s.listHeader}>FlatList test ({items.length} items):</Text>
      <FlatList
        data={items}
        keyExtractor={i => i.id || String(Math.random())}
        style={{ flex: 1 }}
        onScrollBeginDrag={() => addLog('onScrollBeginDrag FIRED ✅')}
        onScroll={() => addLog('onScroll FIRED ✅')}
        onTouchStart={() => addLog('onTouchStart FIRED ✅')}
        scrollEventThrottle={100}
        renderItem={({ item, index }) => (
          <View style={s.row}>
            <Text style={s.rowText}>{index + 1}. {item.name || item.prefecture || 'Item'} — {item.price || '?'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Loading...</Text>}
      />
      <Text style={s.footer}>If you can scroll this list, FlatList works in production.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  closeBtn: { backgroundColor: '#e85d2f', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  logHeader: { color: '#6b7280', fontSize: 11, paddingHorizontal: 16, marginTop: 4 },
  logText: { color: '#86efac', fontSize: 10, paddingHorizontal: 16, fontFamily: 'Courier' },
  listHeader: { color: '#9ca3af', fontSize: 12, paddingHorizontal: 16, paddingVertical: 6 },
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowText: { color: '#fff', fontSize: 13 },
  empty: { color: '#6b7280', textAlign: 'center', padding: 20 },
  footer: { color: '#4b5563', fontSize: 10, textAlign: 'center', padding: 8 },
});
