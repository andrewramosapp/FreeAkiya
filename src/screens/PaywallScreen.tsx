import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import { packageLabel } from '../lib/purchases';

export default function PaywallScreen({
  packages,
  loading,
  error,
  onPurchase,
  onRestore,
  onClose,
}: {
  packages: PurchasesPackage[];
  loading: boolean;
  error?: string | null;
  onPurchase: (pkg: PurchasesPackage) => void;
  onRestore: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Fixed close button — always visible, never scrolls away */}
      <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text style={s.close}>✕  Close</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Cheap Akiya Pro</Text>
        <Text style={s.subtitle}>Unlock premium listings, deeper details, and full member access.</Text>

        {loading ? (
          <ActivityIndicator color="#e85d2f" style={{ marginVertical: 32 }} />
        ) : packages.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Unable to load pricing. Check your connection and try again.</Text>
            <TouchableOpacity style={s.restoreBtn} onPress={onRestore}>
              <Text style={s.restoreText}>Retry / Restore Purchases</Text>
            </TouchableOpacity>
          </View>
        ) : (
          packages.map((pkg) => (
            <TouchableOpacity key={pkg.identifier} style={s.card} onPress={() => onPurchase(pkg)} disabled={loading}>
              <Text style={s.cardTitle}>{packageLabel(pkg)}</Text>
              <Text style={s.cardPrice}>{pkg.product.priceString}</Text>
            </TouchableOpacity>
          ))
        )}

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.restoreBtn} onPress={onRestore} disabled={loading}>
          <Text style={s.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={s.foot}>
          Subscriptions managed by RevenueCat. Cancel anytime in App Store settings.
        </Text>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0a0a0a' },
  closeBtn:    { paddingHorizontal: 20, paddingVertical: 14 },
  close:       { color: '#9ca3af', fontSize: 16, fontWeight: '600' },
  wrap:        { paddingHorizontal: 24, paddingBottom: 24 },
  title:       { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  subtitle:    { color: '#9ca3af', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  card:        { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle:   { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardPrice:   { color: '#e85d2f', fontSize: 16, fontWeight: '700' },
  restoreBtn:  { marginTop: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  restoreText: { color: '#fff', fontWeight: '700' },
  error:       { color: '#f87171', fontWeight: '700', marginTop: 14 },
  foot:        { color: '#6b7280', fontSize: 12, marginTop: 18, lineHeight: 18 },
  emptyCard:   { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 12 },
  emptyText:   { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
});
