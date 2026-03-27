import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function PriceRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  onChange,
}: {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.value}>${minVal.toLocaleString()}</Text>
        <Text style={s.value}>${maxVal >= max ? `${max.toLocaleString()}+` : maxVal.toLocaleString()}</Text>
      </View>
      <Text style={s.label}>Minimum price</Text>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={1000}
        value={minVal}
        minimumTrackTintColor="#e85d2f"
        maximumTrackTintColor="#374151"
        thumbTintColor="#e85d2f"
        onValueChange={(v) => onChange(Math.min(v, maxVal - 1000), maxVal)}
      />
      <Text style={[s.label, { marginTop: 8 }]}>Maximum price</Text>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={1000}
        value={maxVal}
        minimumTrackTintColor="#e85d2f"
        maximumTrackTintColor="#374151"
        thumbTintColor="#e85d2f"
        onValueChange={(v) => onChange(minVal, Math.max(v, minVal + 1000))}
      />
      <View style={s.rowMuted}>
        <Text style={s.muted}>${min.toLocaleString()}</Text>
        <Text style={s.muted}>${max.toLocaleString()}+</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowMuted: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  value: { color: '#fff', fontWeight: '700', fontSize: 13 },
  muted: { color: '#6b7280', fontSize: 11 },
  label: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
});
