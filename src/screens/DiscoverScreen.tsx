import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PoemCard from '../components/PoemCard';
import ScreenContainer from '../components/layout/ScreenContainer';
import SkeletonPoemCard from '../components/loaders/SkeletonPoemCard';
import { Poem } from '../types/poem';
import {
  fetchTrendingPoems,
  fetchEditorsPicks,
  fetchRandomPoem,
  fetchNewAuthors,
  fetchWeeklyDigest,
} from '../services/discoveryService';
import { incrementPoemLikes } from '../services/poemService';
import { openAuthorProfile, openPoemDetail } from '../navigation/navigationHelpers';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

const DiscoverScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [trending, setTrending] = useState<Poem[]>([]);
  const [picks, setPicks] = useState<Poem[]>([]);
  const [digest, setDigest] = useState<Poem[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [randomPoem, setRandomPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, p, d, a] = await Promise.all([
        fetchTrendingPoems(8),
        fetchEditorsPicks(6),
        fetchWeeklyDigest(5),
        fetchNewAuthors(6),
      ]);
      setTrending(t);
      setPicks(p);
      setDigest(d);
      setAuthors(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    hapticLight();
    await load();
    setRefreshing(false);
  };

  const handleRandom = async () => {
    hapticLight();
    const poem = await fetchRandomPoem();
    setRandomPoem(poem);
  };

  const handleLike = async (poemId: string) => {
    await incrementPoemLikes(poemId);
  };

  const renderPoem = (poem: Poem, key?: string) => (
    <PoemCard
      key={key || poem.id}
      poem={poem}
      onPress={() => openPoemDetail(navigation, poem)}
      onAuthorPress={() => openAuthorProfile(navigation, poem.author?.id ?? poem.author_id)}
      onLike={() => handleLike(poem.id)}
    />
  );

  if (loading) {
    return (
      <ScreenContainer edges={[]}>
        <SkeletonPoemCard />
        <SkeletonPoemCard />
      </ScreenContainer>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgCanvas }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <ScreenContainer edges={[]} scrollable={false}>
        <TouchableOpacity
          style={[styles.serendipityPill, { backgroundColor: colors.cardHeaderTint, borderColor: colors.borderSubtle }]}
          onPress={handleRandom}
          activeOpacity={0.8}
        >
          <Ionicons name="dice-outline" size={20} color={colors.brandPrimary} />
          <View style={styles.serendipityText}>
            <Text style={[theme.typography.labelBold, { color: colors.brandPrimary }]}>
              Serendipity Dice
            </Text>
            <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
              Discover a random verse
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {randomPoem && renderPoem(randomPoem, 'random')}

        <Text style={[styles.sectionTitle, theme.typography.labelBold, { color: colors.textPrimary }]}>
          Trending This Week
        </Text>
        {trending.map((poem) => renderPoem(poem))}

        <Text style={[styles.sectionTitle, theme.typography.labelBold, { color: colors.textPrimary }]}>
          Editors' Picks
        </Text>
        {picks.map((poem) => renderPoem(poem, `pick-${poem.id}`))}

        <Text style={[styles.sectionTitle, theme.typography.labelBold, { color: colors.textPrimary }]}>
          Weekly Digest
        </Text>
        {digest.map((poem) => renderPoem(poem, `digest-${poem.id}`))}

        <Text style={[styles.sectionTitle, theme.typography.labelBold, { color: colors.textPrimary }]}>
          New Authors
        </Text>
        <View style={styles.authorGrid}>
          {authors.map((author) => (
            <TouchableOpacity
              key={author.id}
              style={[styles.authorChip, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
              onPress={() => openAuthorProfile(navigation, author)}
            >
              <Text style={[theme.typography.labelBold, { color: colors.brandPrimary }]}>
                {author.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScreenContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  serendipityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  serendipityText: { flex: 1 },
  sectionTitle: { fontSize: 16, marginVertical: 12 },
  authorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  authorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
});

export default DiscoverScreen;
