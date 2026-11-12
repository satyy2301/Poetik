import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type OnboardingScreenProps = {
  onDone: () => void;
  onSignIn?: () => void;
};

const OnboardingScreen = ({ onDone, onSignIn }: OnboardingScreenProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const advance = () => {
    if (index < 2) {
      setIndex(index + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    onDone();
  };

  const kickers = ['STEP 1 OF 3', 'STEP 2 OF 3', 'STEP 3 OF 3'];
  const ctas = ['Next', 'Next', 'Get started'];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgCanvas, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.column}>
        <View style={styles.top}>
          <View style={styles.meter}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.meterSeg,
                  { backgroundColor: i <= index ? colors.brandPrimary : colors.bgElevated },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.meta, styles.kicker, { color: colors.brandSecondary }]}>{kickers[index]}</Text>
          <TouchableOpacity onPress={onDone} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {index === 0 ? <ReadPreview /> : null}
          {index === 1 ? <WritePreview /> : null}
          {index === 2 ? <LearnPreview /> : null}
        </ScrollView>

        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.brandPrimary }, theme.shadows.floating]}
          onPress={advance}
          activeOpacity={0.9}
        >
          <Text style={[styles.buttonLabel, { color: colors.onBrand }]}>{ctas[index]}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onBrand} />
        </TouchableOpacity>

        {index === 2 ? (
          <TouchableOpacity onPress={onSignIn ?? onDone} style={styles.signIn}>
            <Text style={[styles.copy, { color: colors.textPrimary, textAlign: 'center' }]}>
              Already a poet? <Text style={{ color: colors.brandSecondary }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 18 : 8,
                  backgroundColor: i === index ? colors.brandSecondary : colors.borderSubtle,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const Chip = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View style={[styles.chip, { backgroundColor: colors.bgCanvas, borderColor: colors.borderMuted }]}>
      <Ionicons name={icon} size={16} color={colors.brandSecondary} />
      <Text style={[styles.meta, { color: colors.textPrimary }]}>{label}</Text>
    </View>
  );
};

const ReadPreview = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View>
      <View style={styles.floatRow}>
        <Chip icon="book-outline" label="POEMS TO READ" />
        <Chip icon="library" label="COLLECTIONS" />
      </View>
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <View style={styles.cardTop}>
          <View style={[styles.pill, { backgroundColor: colors.bgElevated }]}>
            <View style={[styles.pip, { backgroundColor: colors.brandSecondary }]} />
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>EVENING POEM</Text>
          </View>
          <Text style={[styles.meta, { color: colors.textPrimary }]}>SONNET</Text>
        </View>
        <Text style={[theme.typography.poemTitle, { color: colors.textPrimary, marginTop: 12 }]}>A Nocturne in Emerald</Text>
        <Text style={[styles.copy, { color: colors.textPrimary, fontStyle: 'italic', marginTop: 4 }]}>
          by R. Vance · Sonnet
        </Text>
        <View style={[styles.verseWell, { backgroundColor: colors.bgCanvas, borderColor: colors.borderMuted, borderLeftColor: colors.brandPrimary }]}>
          <Text style={[styles.verse, { color: colors.textPrimary }]}>
            "The lantern wavers in the quiet crypt,{'\n'}
            A spool of gilded hours unwind in dust;{'\n'}
            Where antique quills in resin wax are dipped,{'\n'}
            We weigh the quiet silence that we trust."
          </Text>
          <View style={styles.verseFoot}>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>RHYMING LINES</Text>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>VERSE 1 OF 4</Text>
          </View>
        </View>
        <View style={styles.player}>
          <View style={[styles.play, { backgroundColor: colors.brandPrimary }]}>
            <Ionicons name="play" size={16} color={colors.onBrand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.copy, { color: colors.textPrimary }]}>Read by Julian Dane</Text>
            <Text style={[styles.meta, { color: colors.textPrimary, marginTop: 2 }]}>2 MIN READ</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.bgElevated }]}>
            <View style={[styles.trackFill, { backgroundColor: colors.brandPrimary }]} />
          </View>
        </View>
      </View>
      <View style={styles.chipRow}>
        <Chip icon="create-outline" label="NOTES IN THE MARGIN" />
        <Chip icon="bookmark-outline" label="SAVE FOR LATER" />
      </View>
      <Text style={[styles.meta, styles.eyebrow, { color: colors.brandSecondary }]}>READ</Text>
      <Text style={[theme.typography.displaySm, styles.title, { color: colors.textPrimary }]}>Read poems</Text>
      <Text style={[styles.copy, styles.body, { color: colors.textPrimary }]}>
        Find poems from classic and new writers. Save the ones you want to come back to.
      </Text>
    </View>
  );
};

const rhymes = [
  { word: 'ember', note: 'sounds like' },
  { word: 'remember', note: '3 beats' },
  { word: 'slumber', note: 'close' },
];

const WritePreview = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View>
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>DRAFT</Text>
            <Text style={[theme.typography.poemTitle, { color: colors.textPrimary, marginTop: 4 }]}>A quiet evening</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.bgElevated }]}>
            <View style={[styles.pip, { backgroundColor: colors.brandSecondary }]} />
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>10 SYLLABLES</Text>
          </View>
        </View>
        <Text style={[styles.verse, { color: colors.textPrimary, marginTop: 14 }]}>
          The quiet quill invites an emerald flame,
        </Text>
        <View style={[styles.activeLine, { borderLeftColor: colors.brandPrimary, backgroundColor: colors.bgCanvas }]}>
          <Text style={[theme.typography.poemTitle, { color: colors.brandSecondary }]}>Where shadows linger{'\n'}near the dying</Text>
          <View style={[styles.caret, { backgroundColor: colors.brandSecondary }]} />
        </View>
        <View style={styles.syllables}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={[styles.syllable, { backgroundColor: i < 5 ? colors.brandPrimary : colors.bgElevated }]} />
          ))}
        </View>
        <View style={[styles.rhymeBox, { backgroundColor: colors.bgCanvas, borderColor: colors.borderMuted }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>RHYME IDEAS</Text>
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>SUGGESTIONS</Text>
          </View>
          <View style={styles.rhymeRow}>
            {rhymes.map((rhyme) => (
              <View key={rhyme.word} style={[styles.rhymeChip, { borderColor: colors.borderSubtle, backgroundColor: colors.bgSurface }]}>
                <Text style={[styles.copy, { color: colors.textPrimary }]}>{rhyme.word}</Text>
                <Text style={[styles.meta, { color: colors.textPrimary, marginTop: 4 }]}>{rhyme.note}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.meta, styles.eyebrow, { color: colors.brandSecondary }]}>WRITE</Text>
      <Text style={[theme.typography.displaySm, styles.title, { color: colors.textPrimary }]}>Write your own</Text>
      <Text style={[styles.copy, styles.body, { color: colors.textPrimary }]}>
        Start a draft. Try a sonnet or a haiku, or write in free verse.
      </Text>
    </View>
  );
};

const LearnPreview = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View>
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <View style={styles.cardTop}>
          <Text style={[styles.meta, { color: colors.textPrimary }]}>STUDY GROUP · 8 PEOPLE</Text>
          <View style={[styles.pill, { backgroundColor: colors.bgCanvas, borderWidth: 1, borderColor: colors.borderSubtle }]}>
            <View style={[styles.pip, { backgroundColor: colors.brandSecondary }]} />
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>LIVE</Text>
          </View>
        </View>
        <Text style={[theme.typography.poemTitle, { color: colors.textPrimary, marginTop: 10 }]}>The Midnight Ink Society</Text>
        <Text style={[styles.copy, { color: colors.textPrimary, marginTop: 4 }]}>Prompt: write a night poem</Text>
        <View style={styles.split}>
          <View style={[styles.tile, { backgroundColor: colors.bgCanvas, borderColor: colors.borderMuted }]}>
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>LESSON</Text>
            <Text style={[theme.typography.headerTitle, { color: colors.textPrimary, marginTop: 8 }]}>Sonnets</Text>
            <Text style={[styles.copy, { color: colors.textPrimary }]}>The first 8 lines</Text>
            <View style={[styles.bar, { backgroundColor: colors.bgElevated }]}>
              <View style={[styles.barFill, { width: '80%', backgroundColor: colors.brandPrimary }]} />
            </View>
          </View>
          <View style={[styles.tile, { backgroundColor: colors.bgCanvas, borderColor: colors.borderMuted }]}>
            <Text style={[styles.meta, { color: colors.brandSecondary }]}>STREAK</Text>
            <Text style={[theme.typography.displaySm, { color: colors.brandSecondary, marginTop: 6 }]}>7</Text>
            <Text style={[styles.meta, { color: colors.textPrimary }]}>DAYS IN A ROW</Text>
            <Text style={[styles.meta, { color: colors.textPrimary, marginTop: 8 }]}>KEEP GOING</Text>
          </View>
        </View>
        <View style={[styles.challenge, { backgroundColor: colors.bgElevated, borderColor: colors.borderMuted }]}>
          <Ionicons name="pencil" size={16} color={colors.brandSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.copy, { color: colors.textPrimary, fontWeight: '700' }]}>Today’s challenge</Text>
            <Text style={[styles.copy, { color: colors.textPrimary }]}>Write 14 lines</Text>
          </View>
          <Text style={[styles.meta, styles.xp, { backgroundColor: colors.brandPrimary, color: colors.onBrand }]}>+50 XP</Text>
        </View>
      </View>
      <View style={styles.pillars}>
        <View style={[styles.pillar, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
          <Ionicons name="school-outline" size={18} color={colors.brandSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.copy, { color: colors.textPrimary, fontWeight: '700' }]}>Poetry lessons</Text>
            <Text style={[styles.copy, { color: colors.textPrimary }]}>Sonnets, haiku, and free verse.</Text>
          </View>
        </View>
        <View style={[styles.pillar, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
          <Ionicons name="people-outline" size={18} color={colors.brandSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.copy, { color: colors.textPrimary, fontWeight: '700' }]}>Write with others</Text>
            <Text style={[styles.copy, { color: colors.textPrimary }]}>Share notes and read each other’s poems.</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.meta, styles.eyebrow, { color: colors.brandSecondary }]}>LEARN</Text>
      <Text style={[theme.typography.displaySm, styles.title, { color: colors.textPrimary }]}>Learn and meet poets</Text>
      <Text style={[styles.copy, styles.body, { color: colors.textPrimary }]}>
        Short lessons, quizzes, and a daily writing challenge. Then talk with other poets.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center' },
  column: { width: '100%', maxWidth: 460, flex: 1, paddingHorizontal: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  meter: { flexDirection: 'row', gap: 4, width: 92 },
  meterSeg: { flex: 1, height: 3, borderRadius: 2 },
  kicker: { flex: 1 },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.3 },
  copy: { fontSize: 16, lineHeight: 24 },
  verse: { fontSize: 18, lineHeight: 28, fontStyle: 'italic' },
  buttonLabel: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  scroll: { paddingBottom: 12 },
  floatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: -10, zIndex: 2, paddingHorizontal: 8 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pip: { width: 6, height: 6, borderRadius: 3 },
  verseWell: { marginTop: 14, borderWidth: 1, borderLeftWidth: 2, borderRadius: 8, padding: 12 },
  verseFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  play: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  track: { width: 64, height: 4, borderRadius: 2, overflow: 'hidden' },
  trackFill: { width: '66%', height: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 8 },
  eyebrow: { textAlign: 'center', marginTop: 22, marginBottom: 8 },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', marginTop: 10 },
  activeLine: { marginTop: 10, borderLeftWidth: 2, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'flex-start' },
  caret: { width: 2, height: 22, marginLeft: 6, marginTop: 4 },
  syllables: { flexDirection: 'row', gap: 6, marginTop: 12 },
  syllable: { width: 16, height: 6, borderRadius: 3 },
  rhymeBox: { marginTop: 14, borderWidth: 1, borderRadius: 8, padding: 12 },
  rhymeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  rhymeChip: { flex: 1, borderWidth: 1, borderRadius: 4, padding: 8 },
  split: { flexDirection: 'row', gap: 8, marginTop: 14 },
  tile: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10 },
  bar: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 4 },
  challenge: { marginTop: 10, borderWidth: 1, borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  xp: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  pillars: { gap: 8, marginTop: 12 },
  pillar: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 12 },
  cta: {
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  signIn: { alignItems: 'center', marginTop: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  dot: { height: 8, borderRadius: 999 },
});

export default OnboardingScreen;
