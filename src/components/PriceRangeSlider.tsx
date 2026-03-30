import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

      <View style={s.sliderWrap}>
        <MultiSlider
          values={[minVal, maxVal]}
          min={min}
          max={max}
          step={1000}
          sliderLength={SCREEN_WIDTH - 72}
          onValuesChange={([nextMin, nextMax]) => onChange(nextMin, nextMax)}
          selectedStyle={{ backgroundColor: '#e85d2f' }}
          unselectedStyle={{ backgroundColor: '#374151' }}
          containerStyle={s.sliderContainer}
          trackStyle={s.track}
          markerStyle={s.marker}
        />
      </View>

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
  rowMuted: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  value: { color: '#fff', fontWeight: '700', fontSize: 13 },
  muted: { color: '#6b7280', fontSize: 11 },
  sliderWrap: { alignItems: 'center', justifyContent: 'center' },
  sliderContainer: { height: 34 },
  track: { height: 4, borderRadius: 999 },
  marker: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#e85d2f', borderWidth: 2, borderColor: '#fff' },
});
