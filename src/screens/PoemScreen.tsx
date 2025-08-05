// src/screens/PoemScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PoemScreen = ({ route }) => {
  const navigation = useNavigation();
  const { poem } = route.params || {};
  
  // Fallback poem data if no poem is passed
  const poemData = poem || {
    title: 'Morning Dew',
    content: 'Dewdrops hold the world in their crystal spheres—morning\'s first gift.',
    author: { name: 'River Stone' },
    reads: 756,
    like_count: 423,
    themes: ['Nature']
  };

  // Handle both old structure (theme) and new structure (themes array)
  const themeDisplay = poemData.themes && poemData.themes.length > 0 
    ? poemData.themes[0] 
    : poemData.theme || 'General';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${poemData.title}\n\n${poemData.content}\n\n- ${poemData.author?.name || poemData.author}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLike = () => {
    // Would implement like functionality
    alert('Liked!');
  };

  const handleSave = () => {
    // Would implement save functionality
    alert('Saved!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#2d3436" />
      </TouchableOpacity>

      <View style={styles.poemContainer}>
        <Text style={styles.themeTag}>{themeDisplay}</Text>
        <Text style={styles.title}>{poemData.title}</Text>
        <Text style={styles.content}>{poemData.content}</Text>
        <Text style={styles.author}>— {poemData.author?.name || poemData.author}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.reads}>{poemData.reads || 0} reads</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name="heart-outline" size={24} color="#e17055" />
            <Text style={styles.actionText}>{poemData.like_count || poemData.likes || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="bookmark-outline" size={24} color="#636e72" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#636e72" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  poemContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  themeTag: {
    backgroundColor: '#dfe6e9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    color: '#636e72',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
  },
  content: {
    fontSize: 18,
    lineHeight: 30,
    color: '#2d3436',
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reads: {
    color: '#636e72',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  actionText: {
    marginLeft: 5,
    color: '#636e72',
  },
});

export default PoemScreen;