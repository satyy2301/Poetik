// src/components/PoemCard.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const PoemCard = ({ poem, onPress, onAuthorPress }) => {
  const previewContent = poem.content.length > 100 
    ? `${poem.content.substring(0, 100)}...` 
    : poem.content;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{poem.title || 'Untitled'}</Text>
      <Text style={styles.content}>{previewContent}</Text>
      
      <TouchableOpacity onPress={onAuthorPress}>
        <Text style={styles.author}>@{poem.author.username}</Text>
      </TouchableOpacity>
      
      <View style={styles.stats}>
        <Text style={styles.likes}>❤️ {poem.like_count} likes</Text>
        <Text style={styles.date}>
          {new Date(poem.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#34495e',
  },
  author: {
    color: '#3498db',
    marginBottom: 8,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likes: {
    color: '#e74c3c',
  },
  date: {
    color: '#7f8c8d',
  },
});

export default PoemCard;