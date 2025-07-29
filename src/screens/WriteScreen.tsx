// src/screens/WriteScreen.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, Button, StyleSheet, Text , TouchableOpacity} from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'
import keyboard from 'react-native-keyboard';
import ionicons from 'react-native-vector-icons/Ionicons';
import materialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
// Define the props type for this screen
type WriteScreenProps = NativeStackScreenProps<RootStackParamList, 'Write'>;

const WriteScreen = ({ navigation }: WriteScreenProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [syllableCount, setSyllableCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const contentInputRef = useRef<TextInput>(null);
  const countSyllables = (text: string) => {
    // Simple syllable counter (can be enhanced)
    const words = text.trim().split(/\s+/);
    return words.reduce((count, word) => count + Math.max(1, word.length / 3), 0);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setSyllableCount(estimateSyllables(text));
  };

  // Simple syllable estimation (would use a library in production)
  const estimateSyllables = (text: string) => {
    return Math.floor(text.length / 3); // Rough approximation
  };

  // Get AI suggestions for the current poem
  const getAiSuggestions = async () => {
    if (!content.trim()) {
      alert('Please write something first!');
      return;
    }

    Keyboard.dismiss();
    setIsAiLoading(true);
    
    try {
      const { data } = await supabase.functions.invoke('poem-suggestions', {
        body: {
          title,
          content,
          userId: user?.id
        }
      });

      setAiSuggestions(data.suggestions);
    } catch (error) {
      console.error('AI suggestion error:', error);
      alert('Failed to get suggestions. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply a suggestion to the poem
  const applySuggestion = (suggestion: string) => {
    setContent(suggestion);
    contentInputRef.current?.focus();
    setAiSuggestions([]);
  };
  const saveDraft = async () => {
    await AsyncStorage.setItem('draft', JSON.stringify({ title, content }));
  };

  const publishPoem = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

    const { error } = await supabase
      .from('poems')
      .insert([{ 
        title: title || 'Untitled', 
        content, 
        author_id: user.id 
      }]);

    if (!error) {
      setTitle('');
      setContent('');
      await AsyncStorage.removeItem('draft');
      navigation.navigate('Read');
    }
  };

    const handleAIHelp = () => {
    Keyboard.dismiss();
    // Would integrate with Hugging Face API here
    alert('AI suggestions would appear here');
  };

    return (
    <View style={styles.container}>
      {/* Header with publish button */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>New Poem</Text>
        <TouchableOpacity style={styles.publishButton}>
          <Text style={styles.publishButtonText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Title input */}
      <TextInput
        style={styles.titleInput}
        placeholder="Give your poem a title..."
        placeholderTextColor="#95a5a6"
        value={title}
        onChangeText={setTitle}
      />

      {/* Content input */}
      <TextInput
        ref={contentInputRef}
        style={styles.contentInput}
        placeholder="Let your words flow..."
        placeholderTextColor="#95a5a6"
        multiline
        value={content}
        onChangeText={handleContentChange}
        scrollEnabled={!aiSuggestions.length}
      />

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.formatButtons}>
          <TouchableOpacity style={styles.formatButton}>
            <Text style={styles.formatButtonText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.formatButton}>
            <Text style={styles.formatButtonText}>I</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.statText}>{syllableCount} syllables</Text>
        <Text style={styles.statText}>{wordCount} words</Text>
      </View>

      {/* AI Suggestions Section */}
      {aiSuggestions.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
          {aiSuggestions.map((suggestion, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.suggestionItem}
              onPress={() => applySuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.closeSuggestions}
            onPress={() => setAiSuggestions([])}
          >
            <MaterialIcons name="close" size={24} color="#7f8c8d" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={getAiSuggestions}
          disabled={isAiLoading}
        >
          <MaterialIcons 
            name="auto-awesome" 
            size={20} 
            color={isAiLoading ? "#bdc3c7" : "#3498db"} 
          />
          <Text style={[
            styles.aiButtonText,
            isAiLoading && styles.aiButtonTextDisabled
          ]}>
            {isAiLoading ? 'Thinking...' : 'AI Assistant'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  publishButton: {
    backgroundColor: '#00b894',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  publishButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formatButton: {
    backgroundColor: '#dfe6e9',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatButtonText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 10,
  },
  aiButtonText: {
    marginLeft: 8,
    color: '#3498db',
    fontWeight: '600',
  },
  aiButtonTextDisabled: {
    color: '#bdc3c7',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionsTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  suggestionText: {
    color: '#34495e',
    lineHeight: 22,
  },
  closeSuggestions: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default WriteScreen;