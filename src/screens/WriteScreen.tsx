// src/screens/WriteScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text , TouchableOpacity,Keyboard, Alert, Modal, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'
import ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useOpenAI } from '../context/OpenAIContext';
import createOpenAIClient from '../lib/openai';

// Define the props type for this screen
type WriteScreenProps = NativeStackScreenProps<RootStackParamList, 'Write'>;

// Poem categories/themes
const POEM_CATEGORIES = [
  'Romantic', 'Classic', 'Nature', 'Love', 'Melancholy', 'Joy', 'Spiritual', 
  'Philosophy', 'Friendship', 'Family', 'Loss', 'Hope', 'Adventure', 'Dreams',
  'Seasons', 'City Life', 'Rural', 'War', 'Peace', 'Freedom', 'Other'
];

const POEM_FORMS = [
  'Free Verse', 'Sonnet', 'Haiku', 'Limerick', 'Ballad', 'Ode', 'Epic', 
  'Lyric', 'Narrative', 'Acrostic', 'Cinquain', 'Tanka', 'Villanelle', 'Other'
];

const WriteScreen = ({ navigation }: WriteScreenProps) => {
  const { user } = useAuth();
  const { apiKey, setApiKey } = useOpenAI();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [syllableCount, setSyllableCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');
  const contentInputRef = useRef<TextInput>(null);
  const [aiTemplate, setAiTemplate] = useState<'suggest' | 'continue' | 'shorten' | 'tone' >('suggest');
  const [aiTemperature, setAiTemperature] = useState<number>(0.8);
  const [aiMaxTokens, setAiMaxTokens] = useState<number>(400);
  const [aiError, setAiError] = useState<string | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const countSyllables = (text: string) => {
    // Simple syllable counter (can be enhanced)
    const words = text.trim().split(/\s+/);
    return words.reduce((count, word) => count + Math.max(1, word.length / 3), 0);
  };

  // Load last-used AI settings
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('AI_SETTINGS');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAiTemplate(parsed.template || 'suggest');
          setAiTemperature(parsed.temperature ?? 0.8);
          setAiMaxTokens(parsed.maxTokens ?? 400);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const persistAISettings = async () => {
    try {
      await AsyncStorage.setItem('AI_SETTINGS', JSON.stringify({ template: aiTemplate, temperature: aiTemperature, maxTokens: aiMaxTokens }));
    } catch (e) {
      // ignore
    }
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
  const requestAISuggestionsDirect = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setAiError(null);
    setIsAiLoading(true);
    try {
      const client = createOpenAIClient(apiKey);

      // Build prompt variants based on template
      let prompt = '';
      switch (aiTemplate) {
        case 'continue':
          prompt = `Continue and finish this poem in its current tone and style. Return a single poem text.\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'shorten':
          prompt = `Shorten the following poem while preserving meaning. Provide up to 3 alternate concise versions in a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'tone':
          prompt = `Rewrite the poem in a different tone (give 3 variants) — options: solemn, joyful, ironic. Return a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
          break;
        case 'suggest':
        default:
          prompt = `Suggest up to 5 concise alternate versions or improvements for the following poem content. Return as a JSON array of strings.\n\nTitle: ${title}\nContent: ${content}`;
      }

      const response = await client.responses.create({
        model: 'gpt-4o-mini',
        input: prompt,
        max_tokens: Math.min(2000, aiMaxTokens),
        temperature: Math.max(0, Math.min(1, aiTemperature)),
      });

      const text = response.output_text || (response.output?.[0]?.content?.[0]?.text) || '';
      let suggestions: string[] = [];
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) suggestions = parsed.map(String).slice(0, 10);
      } catch (err) {
        // Fallback: split by blank lines or newlines
        suggestions = text.split(/\n\n|\n/).map(s => s.trim()).filter(Boolean).slice(0, 10);
      }

      setAiSuggestions(suggestions);
      await persistAISettings();
    } catch (err: any) {
      console.error('OpenAI request failed', err);
      if (err?.status === 429 || (err?.message && err.message.toLowerCase().includes('rate')) ) {
        setAiError('Rate limit reached — try again in a moment.');
      } else if (err?.message && err.message.toLowerCase().includes('permission')) {
        setAiError('API key invalid or lacks permission. Please update your key.');
      } else {
        setAiError('AI request failed. Check API key and network.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply a suggestion to the poem
  const applySuggestion = (suggestion: string) => {
    // push current content to undo stack
    setUndoStack(prev => [...prev, content]);
    setContent(suggestion);
    contentInputRef.current?.focus();
    setAiSuggestions([]);
  };
  const undo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setContent(last);
      return prev.slice(0, prev.length - 1);
    });
  };
  const saveDraft = async () => {
    await AsyncStorage.setItem('draft', JSON.stringify({ title, content }));
  };

  // Preview a suggestion without applying
  const previewSuggestion = (text: string) => {
    setPreviewText(text);
    setPreviewModalVisible(true);
  };

  const publishPoem = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to publish a poem');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please write your poem content before publishing');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please give your poem a title before publishing');
      return;
    }

    setShowCategoryModal(true);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setShowCategoryModal(false);

    try {
      // Use upsert to ensure the author exists
      const { error: authorUpsertError } = await supabase
        .from('authors')
        .upsert([{
          id: user.id,
          name: user.email?.split('@')[0] || 'Unknown User',
          created_at: new Date().toISOString(),
        }], {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (authorUpsertError) {
        console.error('Error upserting author:', authorUpsertError);
        // Continue anyway, the author might already exist
      }

      // Now create the poem
      const poemData = {
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        themes: selectedThemes.length > 0 ? selectedThemes : ['Other'],
        form: selectedForm || 'Free Verse',
        like_count: 0,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('poems')
        .insert([poemData]);

      if (error) throw error;

      // Clear the form
      setTitle('');
      setContent('');
      setSelectedThemes([]);
      setSelectedForm('');
      setWordCount(0);
      setSyllableCount(0);
      
      // Remove draft
      await AsyncStorage.removeItem('draft');

      Alert.alert(
        'Success!', 
        'Your poem has been published successfully!',
        [
          {
            text: 'View Poems',
            onPress: () => navigation.navigate('Read')
          },
          {
            text: 'Write Another',
            style: 'cancel'
          }
        ]
      );

    } catch (error) {
      console.error('Error publishing poem:', error);
      
      // More specific error handling
      if (error.code === '23503') {
        // Foreign key constraint error - try to create author and retry
        try {
          await supabase
            .from('authors')
            .insert([{
              id: user.id,
              name: user.email?.split('@')[0] || 'Unknown User',
              created_at: new Date().toISOString(),
            }]);
          
          // Retry poem insertion
          const poemData = {
            title: title.trim(),
            content: content.trim(),
            author_id: user.id,
            themes: selectedThemes.length > 0 ? selectedThemes : ['Other'],
            form: selectedForm || 'Free Verse',
            like_count: 0,
            created_at: new Date().toISOString(),
          };

          const { error: retryError } = await supabase
            .from('poems')
            .insert([poemData]);

          if (retryError) throw retryError;

          // Success after retry
          setTitle('');
          setContent('');
          setSelectedThemes([]);
          setSelectedForm('');
          setWordCount(0);
          setSyllableCount(0);
          
          await AsyncStorage.removeItem('draft');

          Alert.alert(
            'Success!', 
            'Your poem has been published successfully!',
            [
              {
                text: 'View Poems',
                onPress: () => navigation.navigate('Read')
              },
              {
                text: 'Write Another',
                style: 'cancel'
              }
            ]
          );
          
          return; // Exit successfully
          
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          Alert.alert('Error', 'Failed to create your author profile. Please contact support.');
        }
      } else {
        Alert.alert('Error', 'Failed to publish your poem. Please try again.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const applyFormatting = (format: 'bold' | 'italic') => {
    if (selectionStart === selectionEnd) {
      // No text selected, just insert the formatting markers
      const beforeText = content.substring(0, selectionStart);
      const afterText = content.substring(selectionStart);
      const marker = format === 'bold' ? '**' : '*';
      const newText = beforeText + marker + marker + afterText;
      setContent(newText);
      
      // Move cursor between the markers
      setTimeout(() => {
        try {
          if (contentInputRef.current && typeof (contentInputRef.current as any).setSelection === 'function') {
            (contentInputRef.current as any).setSelection(
              selectionStart + marker.length,
              selectionStart + marker.length
            );
          } else if (contentInputRef.current && typeof (contentInputRef.current as any).setNativeProps === 'function') {
            (contentInputRef.current as any).setNativeProps({ selection: { start: selectionStart + marker.length, end: selectionStart + marker.length } });
          } else if (contentInputRef.current && typeof (contentInputRef.current as any).focus === 'function') {
            (contentInputRef.current as any).focus();
          }
        } catch (e) {
          console.warn('setSelection guard failed', e);
        }
      }, 10);
    } else {
      // Text is selected, wrap it with formatting
      const beforeText = content.substring(0, selectionStart);
      const selectedText = content.substring(selectionStart, selectionEnd);
      const afterText = content.substring(selectionEnd);
      
      const marker = format === 'bold' ? '**' : '*';
      const newText = beforeText + marker + selectedText + marker + afterText;
      setContent(newText);
      
      // Keep selection after formatting
      setTimeout(() => {
        try {
          if (contentInputRef.current && typeof (contentInputRef.current as any).setSelection === 'function') {
            (contentInputRef.current as any).setSelection(
              selectionStart + marker.length,
              selectionEnd + marker.length
            );
          } else if (contentInputRef.current && typeof (contentInputRef.current as any).setNativeProps === 'function') {
            (contentInputRef.current as any).setNativeProps({ selection: { start: selectionStart + marker.length, end: selectionEnd + marker.length } });
          } else if (contentInputRef.current && typeof (contentInputRef.current as any).focus === 'function') {
            (contentInputRef.current as any).focus();
          }
        } catch (e) {
          console.warn('setSelection guard failed', e);
        }
      }, 10);
    }
  };

  const handleContentSelectionChange = (event: any) => {
    setSelectionStart(event.nativeEvent.selection.start);
    setSelectionEnd(event.nativeEvent.selection.end);
  };

    const handleAIHelp = () => {
    Keyboard.dismiss();
    requestAISuggestionsDirect();
  };

    return (
    <View style={styles.container}>
      {/* Header with publish button */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>New Poem</Text>
        <TouchableOpacity 
          style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]} 
          onPress={publishPoem}
          disabled={isPublishing}
        >
          <Text style={styles.publishButtonText}>
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Text>
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
        onSelectionChange={handleContentSelectionChange}
        scrollEnabled={!aiSuggestions.length}
      />

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.formatButtons}>
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => applyFormatting('bold')}
          >
            <Text style={styles.formatButtonText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.formatButton}
            onPress={() => applyFormatting('italic')}
          >
            <Text style={[styles.formatButtonText, styles.italicText]}>I</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.statText}>{syllableCount} syllables</Text>
        <Text style={styles.statText}>{wordCount} words</Text>
      </View>

      {/* AI Controls */}
      <View style={styles.aiControlsContainer}>
        <View style={styles.aiRow}>
          <TouchableOpacity style={[styles.aiTemplateButton, aiTemplate === 'suggest' && styles.aiTemplateSelected]} onPress={() => setAiTemplate('suggest')}>
            <Text style={styles.aiTemplateText}>Suggest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aiTemplateButton, aiTemplate === 'continue' && styles.aiTemplateSelected]} onPress={() => setAiTemplate('continue')}>
            <Text style={styles.aiTemplateText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aiTemplateButton, aiTemplate === 'shorten' && styles.aiTemplateSelected]} onPress={() => setAiTemplate('shorten')}>
            <Text style={styles.aiTemplateText}>Shorten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aiTemplateButton, aiTemplate === 'tone' && styles.aiTemplateSelected]} onPress={() => setAiTemplate('tone')}>
            <Text style={styles.aiTemplateText}>Tone</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.smallLabel}>Temperature (0-1)</Text>
            <TextInput
              value={String(aiTemperature)}
              keyboardType="numeric"
              onChangeText={(t) => {
                const v = parseFloat(t) || 0;
                setAiTemperature(Math.max(0, Math.min(1, v)));
              }}
              style={styles.smallInput}
            />
          </View>

          <View style={{ width: 120 }}>
            <Text style={styles.smallLabel}>Max tokens</Text>
            <TextInput
              value={String(aiMaxTokens)}
              keyboardType="numeric"
              onChangeText={(t) => {
                const v = Math.max(50, Math.min(2000, parseInt(t || '400')));
                setAiMaxTokens(v);
              }}
              style={styles.smallInput}
            />
          </View>
        </View>

        {aiError ? <Text style={styles.aiError}>{aiError}</Text> : null}

        {aiSuggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
            {aiSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <TouchableOpacity style={styles.suggestionItem} onPress={() => applySuggestion(suggestion)}>
                  <Text style={styles.suggestionText} numberOfLines={10}>{suggestion}</Text>
                </TouchableOpacity>
                <View style={styles.suggestionActions}>
                  <TouchableOpacity onPress={() => previewSuggestion(suggestion)} style={styles.previewButton}><Text style={styles.previewText}>Preview</Text></TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.suggestionFooter}>
              <TouchableOpacity onPress={() => setAiSuggestions([])} style={styles.cancelButton}><Text style={styles.cancelButtonText}>Close</Text></TouchableOpacity>
              <TouchableOpacity disabled={undoStack.length === 0} onPress={undo} style={[styles.confirmButton, undoStack.length === 0 && styles.confirmButtonDisabled]}><Text style={styles.confirmButtonText}>Undo</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={handleAIHelp}
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
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Categorize Your Poem</Text>
              
              {/* Themes Selection */}
              <Text style={styles.sectionTitle}>Select Themes (up to 3):</Text>
              <View style={styles.categoriesGrid}>
                {POEM_CATEGORIES.map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.categoryChip,
                      selectedThemes.includes(theme) && styles.categoryChipSelected
                    ]}
                    onPress={() => toggleTheme(theme)}
                    disabled={!selectedThemes.includes(theme) && selectedThemes.length >= 3}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedThemes.includes(theme) && styles.categoryChipTextSelected
                    ]}>
                      {theme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form Selection */}
              <Text style={styles.sectionTitle}>Poem Form:</Text>
              <View style={styles.categoriesGrid}>
                {POEM_FORMS.map((form) => (
                  <TouchableOpacity
                    key={form}
                    style={[
                      styles.categoryChip,
                      selectedForm === form && styles.categoryChipSelected
                    ]}
                    onPress={() => setSelectedForm(form)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedForm === form && styles.categoryChipTextSelected
                    ]}>
                      {form}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, isPublishing && styles.confirmButtonDisabled]}
                  onPress={handlePublish}
                  disabled={isPublishing}
                >
                  <Text style={styles.confirmButtonText}>
                    {isPublishing ? 'Publishing...' : 'Publish Poem'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>OpenAI API Key</Text>
            <Text style={{ marginBottom: 10 }}>Enter your OpenAI API key to enable AI features (will be stored locally).</Text>
            <TextInput
              placeholder="sk-..."
              value={localApiKey}
              onChangeText={setLocalApiKey}
              style={{ borderWidth: 1, borderColor: '#e9ecef', padding: 10, borderRadius: 8, marginBottom: 10 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowApiKeyModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={async () => { await setApiKey(localApiKey); setShowApiKeyModal(false); }}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={previewModalVisible} animationType="slide" transparent={true} onRequestClose={() => setPreviewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preview Suggestion</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={{ color: '#34495e', lineHeight: 22 }}>{previewText}</Text>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setPreviewModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={() => { applySuggestion(previewText); setPreviewModalVisible(false); }}>
                <Text style={styles.confirmButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  publishButtonDisabled: {
    backgroundColor: '#bdc3c7',
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
  italicText: {
    fontStyle: 'italic',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#495057',
  },
  categoryChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Added style snippets for AI controls
  aiControlsContainer: {
    marginTop: 10,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTemplateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 8,
  },
  aiTemplateSelected: {
    backgroundColor: '#3498db',
  },
  aiTemplateText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  smallLabel: { fontSize: 12, color: '#636e72', marginBottom: 4 },
  smallInput: { borderWidth: 1, borderColor: '#e9ecef', padding: 8, borderRadius: 8, backgroundColor: 'white' },
  aiError: { color: '#e74c3c', marginBottom: 8 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  suggestionActions: { marginLeft: 8 },
  previewButton: { padding: 8 },
  previewText: { color: '#0984e3', fontWeight: '600' },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});

export default WriteScreen;