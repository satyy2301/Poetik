import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PoemCard from '../components/PoemCard';
import { Poem } from '../types/poem';
import {
  fetchTrendingPoems,
  fetchEditorsPicks,
  fetchRandomPoem,
  fetchNewAuthors,
  fetchWeeklyDigest,
} from '../services/discoveryService';
import { incrementPoemLikes } from '../services/poemService';

const DiscoverScreen = () => {
  const navigation = useNavigation<any>();
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
    await load();
    setRefreshing(false);
  };

  const handleRandom = async () => {
    const poem = await fetchRandomPoem();
    setRandomPoem(poem);
  };

  const handleLike = async (poemId: string) => {
    await incrementPoemLikes(poemId);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity style={styles.randomBtn} onPress={handleRandom}>
        <Text style={styles.randomText}>🎲 Random Poem</Text>
      </TouchableOpacity>

      {randomPoem && (
        <View style={styles.section}>
          <PoemCard
            poem={randomPoem}
            onPress={() => navigation.navigate('PoemDetail', { poem: randomPoem })}
            onAuthorPress={() => navigation.navigate('AuthorProfile', { author: randomPoem.author })}
            onLike={() => handleLike(randomPoem.id)}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>🔥 Trending This Week</Text>
      {trending.map((poem) => (
        <PoemCard
          key={poem.id}
          poem={poem}
          onPress={() => navigation.navigate('PoemDetail', { poem })}
          onAuthorPress={() => navigation.navigate('AuthorProfile', { author: poem.author })}
          onLike={() => handleLike(poem.id)}
        />
      ))}

      <Text style={styles.sectionTitle}>⭐ Editors' Picks</Text>
      {picks.map((poem) => (
        <PoemCard
          key={`pick-${poem.id}`}
          poem={poem}
          onPress={() => navigation.navigate('PoemDetail', { poem })}
          onAuthorPress={() => navigation.navigate('AuthorProfile', { author: poem.author })}
          onLike={() => handleLike(poem.id)}
        />
      ))}

      <Text style={styles.sectionTitle}>📬 Weekly Digest</Text>
      {digest.map((poem) => (
        <PoemCard
          key={`digest-${poem.id}`}
          poem={poem}
          onPress={() => navigation.navigate('PoemDetail', { poem })}
          onAuthorPress={() => navigation.navigate('AuthorProfile', { author: poem.author })}
          onLike={() => handleLike(poem.id)}
        />
      ))}

      <Text style={styles.sectionTitle}>✨ New Authors</Text>
      <View style={styles.authorGrid}>
        {authors.map((author) => (
          <TouchableOpacity
            key={author.id}
            style={styles.authorChip}
            onPress={() => navigation.navigate('AuthorProfile', { author })}
          >
            <Text style={styles.authorName}>{author.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  randomBtn: { backgroundColor: '#6c5ce7', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  randomText: { color: 'white', fontWeight: '700', fontSize: 16 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginVertical: 12 },
  authorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  authorChip: { backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 1 },
  authorName: { fontWeight: '600', color: '#3498db' },
});

export default DiscoverScreen;
