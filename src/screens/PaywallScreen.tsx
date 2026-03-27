import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <TouchableOpacity onPress={onClose}><Text style={s.close}>Close</Text></TouchableOpacity>
      <Text style={s.title}>Cheap Akiya Pro</Text>
      <Text style={s.subtitle}>Unlock premium listings, deeper details, and full member access.</Text>

      {packages.map((pkg) => (
        <TouchableOpacity key={pkg.identifier} style={s.card} onPress={() => onPurchase(pkg)} disabled={loading}>
          <Text style={s.cardTitle}>{packageLabel(pkg)}</Text>
          <Text style={s.cardPrice}>{pkg.product.priceString}</Text>
        </TouchableOpacity>
      ))}

      {loading ? <ActivityIndicator color="#e85d2f" style={{ marginTop: 16 }} /> : null}
      {error ? <Text style={s.error}>{error}</Text> : null}

      <TouchableOpacity style={s.restoreBtn} onPress={onRestore} disabled={loading}>
        <Text style={s.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <Text style={s.foot}>Monthly, Yearly, and Lifetime products are managed by RevenueCat. Entitlement required: Cheap Akiya Pro.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 24, backgroundColor: '#0a0a0a', flexGrow: 1 },
  close: { color: '#9ca3af', fontSize: 14, marginBottom: 18 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  subtitle: { color: '#9ca3af', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardPrice: { color: '#e85d2f', fontSize: 16, fontWeight: '700' },
  restoreBtn: { marginTop: 18, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  restoreText: { color: '#fff', fontWeight: '700' },
  error: { color: '#f87171', fontWeight: '700', marginTop: 14 },
  foot: { color: '#6b7280', fontSize: 12, marginTop: 18, lineHeight: 18 },
});
