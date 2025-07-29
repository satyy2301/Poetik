// src/screens/PoemScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PoemScreen = ({ route }) => {
  const { poem } = route.params || {
    title: 'Morning Dew',
    content: 'Dewdrops hold the world in their crystal spheres—morning\'s first gift.',
    author: 'River Stone',
    reads: 756,
    likes: 423,
    theme: 'Nature'
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${poem.title}\n\n${poem.content}\n\n- ${poem.author}`,
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
    <View style={styles.container}>
      <View style={styles.poemContainer}>
        <Text style={styles.themeTag}>{poem.theme}</Text>
        <Text style={styles.title}>{poem.title}</Text>
        <Text style={styles.content}>{poem.content}</Text>
        <Text style={styles.author}>— {poem.author}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.reads}>{poem.reads} reads</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name="heart-outline" size={24} color="#e17055" />
            <Text style={styles.actionText}>{poem.likes}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#f5f7fa',
  },
  poemContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
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