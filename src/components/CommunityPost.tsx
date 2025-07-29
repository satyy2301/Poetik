// src/components/CommunityPost.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CommunityPost = ({ post, currentUserId }) => {
  const isLiked = post.likes?.some(like => like.user_id === currentUserId);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: post.user.avatar_url || 'https://ui-avatars.com/api/?name=' + post.user.username }} 
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{post.user.username}</Text>
          <Text style={styles.timeAgo}>{formatTime(post.created_at)}</Text>
        </View>
      </View>

      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {post.poem && (
        <View style={styles.poemContainer}>
          <Text style={styles.poemTitle}>{post.poem.title}</Text>
          <Text style={styles.poemContent}>
            {post.poem.content.length > 150 
              ? post.poem.content.substring(0, 150) + '...' 
              : post.poem.content}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons 
            name={isLiked ? "favorite" : "favorite-outline"} 
            size={24} 
            color={isLiked ? "#e74c3c" : "#95a5a6"} 
          />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#95a5a6" />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color="#95a5a6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatTime = (dateString) => {
  // Implement your time formatting logic
  return '2h ago';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
  },
  timeAgo: {
    fontSize: 12,
    color: '#95a5a6',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  poemContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  poemTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  poemContent: {
    color: '#34495e',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#95a5a6',
  },
});

export default CommunityPost;