// src/components/PoemCard.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PoemCard = ({ poem, onPress, onAuthorPress, onLike }) => {
  const previewContent = poem.content.length > 100 
    ? `${poem.content.substring(0, 100)}...` 
    : poem.content;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.title}>{poem.title || 'Untitled'}</Text>
        <Text style={styles.content}>{previewContent}</Text>
      </TouchableOpacity>

      <View style={styles.metaContainer}>
        <TouchableOpacity onPress={onAuthorPress} style={styles.authorContainer}>
          <Text style={styles.author}>by {poem.author?.name || 'Unknown'}</Text>
          {poem.era && <Text style={styles.metaText}>{poem.era}</Text>}
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.likeButton} onPress={onLike}>
            <MaterialIcons 
              name="favorite" 
              size={20} 
              color="#e74c3c" 
            />
            <Text style={styles.likeCount}>{poem.like_count || 0}</Text>
          </TouchableOpacity>
          
          {poem.form && <Text style={styles.metaText}>{poem.form}</Text>}
        </View>
      </View>

      {poem.themes?.length > 0 && (
        <View style={styles.themesContainer}>
          {poem.themes.slice(0, 3).map((theme, index) => (
            <View key={index} style={styles.themePill}>
              <Text style={styles.themeText}>{theme}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
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
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  authorContainer: {
    flex: 1,
  },
  author: {
    color: '#3498db',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  likeCount: {
    marginLeft: 4,
    color: '#e74c3c',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  themePill: {
    backgroundColor: '#f0f7ff',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  themeText: {
    fontSize: 12,
    color: '#3498db',
  },
});

export default PoemCard;