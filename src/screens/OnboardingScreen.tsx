import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🏚️',
    title: 'Japan has 9 million\nempty homes.',
    subtitle: 'Most cost less than a used car. CheapAkiya finds them for you — translated into English.',
    accent: '#e85d2f',
  },
  {
    emoji: '🗾',
    title: 'Browse. Filter.\nExplore the map.',
    subtitle: 'Filter by region, price, and condition. Listings are free to browse — no account needed.',
    accent: '#f59e0b',
  },
  {
    emoji: '⭐',
    title: 'Unlock the full\npicture with Premium.',
    subtitle: 'Free members see listings. Premium unlocks station distance, disaster scores, fiber data, subsidy details, and direct seller contact.',
    accent: '#10b981',
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = useCallback((e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / W);
    if (newIndex !== index) setIndex(newIndex);
  }, [index]);

  function next() {
    const nextIndex = index < SLIDES.length - 1 ? index + 1 : null;
    if (nextIndex !== null) {
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    } else {
      onDone();
    }
  }

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={[s.wrap, { paddingBottom: insets.bottom + 24, paddingTop: insets.top + 16 }]}>
      {/* Skip */}
      <TouchableOpacity style={s.skip} onPress={onDone}>
        <Text style={s.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <View style={[s.slide, { width: W }]}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[s.dot, i === index && { backgroundColor: slide.accent, width: 20 }]}
          />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[s.btn, { backgroundColor: slide.accent }]}
        onPress={next}
        activeOpacity={0.85}
      >
        <Text style={s.btnText}>{isLast ? 'Get Started →' : 'Next'}</Text>
      </TouchableOpacity>

      {/* Free access note on last slide */}
      {isLast && (
        <TouchableOpacity onPress={onDone} style={s.freeLink}>
          <Text style={s.freeLinkText}>Browse free listings without signing up →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:      { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center' },
  skip:      { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 8 },
  skipText:  { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  slide:     { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  emoji:     { fontSize: 72, marginBottom: 32 },
  title:     { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40, marginBottom: 16 },
  subtitle:  { color: '#9ca3af', fontSize: 16, textAlign: 'center', lineHeight: 25 },
  dots:      { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  btn:       { width: W - 48, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnText:   { color: '#fff', fontSize: 17, fontWeight: '800' },
  freeLink:  { paddingVertical: 8 },
  freeLinkText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
});
