import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useOpenAI } from '../context/OpenAIContext';
import { FEATURES } from '../config/features';
import RichTextEditor, {
  RichTextEditorRef,
} from '../components/RichTextEditor';
import ScreenContainer from '../components/layout/ScreenContainer';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import TemplateSelector from '../components/TemplateSelector';
import VersionHistoryModal from '../components/VersionHistoryModal';
import { publishPoem as publishPoemToDb, updatePoem } from '../services/poemService';
import { upsertUserAuthor } from '../services/authorService';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  saveVersion,
  fetchVersions,
  DraftVersion,
} from '../services/draftService';
import { PoemTemplate, getTemplateByForm } from '../data/poemTemplates';
import { validateForm } from '../utils/formValidators';
import {
  requestAIWriting,
  AI_TEMPLATES,
  AITemplate,
} from '../services/aiWritingTools';
import { logActivity } from '../services/activityService';
import { palette } from '../theme/tokens/colors';

type WriteScreenProps = { navigation: { navigate: (screen: string) => void } };

function ToolButton({
  label,
  onPress,
  disabled,
  color,
  children,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.toolBtn}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {children}
      <Text style={[styles.toolCaption, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const POEM_CATEGORIES = [
  'Romantic',
  'Classic',
  'Nature',
  'Love',
  'Melancholy',
  'Joy',
  'Spiritual',
  'Philosophy',
  'Friendship',
  'Family',
  'Loss',
  'Hope',
  'Adventure',
  'Dreams',
  'Seasons',
  'City Life',
  'Rural',
  'War',
  'Peace',
  'Freedom',
  'Other',
];

const AUTO_SAVE_MS = 30000;

const WriteScreen = ({ navigation }: WriteScreenProps) => {
  const route = useRoute<any>();
  const editPoem = route.params?.editPoem;
  const { user } = useAuth();
  const { apiKey, setApiKey } = useOpenAI();
  const { theme } = useTheme();
  const colors = theme.colors;
  const editorRef = useRef<RichTextEditorRef>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [syllableCount, setSyllableCount] = useState(0);
  const [selectedForm, setSelectedForm] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<
    PoemTemplate | undefined
  >();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versions, setVersions] = useState<DraftVersion[]>([]);

  const [focusMode, setFocusMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );

  const [aiTemplate, setAiTemplate] = useState<AITemplate>('suggest');
  const [aiTemperature, setAiTemperature] = useState(0.8);
  const [aiMaxTokens, setAiMaxTokens] = useState(400);
  const [styleOf, setStyleOf] = useState('Emily Dickinson');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const validation = validateForm(content, activeTemplate);

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
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    (async () => {
      if (route.params?.editPoem) {
        try {
          const v = await fetchVersions(user.id);
          setVersions(v);
        } catch {
          // table may not exist yet
        }
        return;
      }
      const draft = await loadDraft(user.id);
      if (route.params?.editPoem) return;
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        if (draft.form) {
          setSelectedForm(draft.form);
          setActiveTemplate(getTemplateByForm(draft.form));
        }
        if (draft.themes?.length) {
          setSelectedThemes(draft.themes);
        }
      }
      try {
        const v = await fetchVersions(user.id);
        setVersions(v);
      } catch {
        // table may not exist yet
      }
    })();
  }, [user?.id]);

  const doAutoSave = useCallback(async () => {
    if (editingId || route.params?.editPoem) return;
    if (!user?.id || (!title && !content)) {
      return;
    }
    setSaveStatus('saving');
    await saveDraft(user.id, {
      title,
      content,
      form: selectedForm,
      themes: selectedThemes,
    });
    setLastSaved(new Date());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [editingId, route.params?.editPoem, user?.id, title, content, selectedForm, selectedThemes]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    const timer = setInterval(doAutoSave, AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, [user?.id, doAutoSave]);

  const handleStatsChange = useCallback(
    (stats: { words: number; syllables: number }) => {
      setWordCount(stats.words);
      setSyllableCount(stats.syllables);
    },
    [],
  );

  const handleTemplateSelect = (template: PoemTemplate) => {
    setActiveTemplate(template);
    setSelectedForm(template.form);
    if (!content.trim()) {
      setContent(template.scaffold);
    }
  };

  const handleRestoreVersion = (version: DraftVersion) => {
    setTitle(version.title);
    setContent(version.content);
    if (version.form) {
      setSelectedForm(version.form);
      setActiveTemplate(getTemplateByForm(version.form));
    }
    setShowVersionModal(false);
    Alert.alert(
      'Restored',
      `Version ${version.version_number} loaded into editor.`,
    );
  };

  const persistAISettings = async () => {
    await AsyncStorage.setItem(
      'AI_SETTINGS',
      JSON.stringify({
        template: aiTemplate,
        temperature: aiTemperature,
        maxTokens: aiMaxTokens,
      }),
    );
  };

  const requestAISuggestions = async () => {
    if (!FEATURES.AI_ENABLED) {
      return;
    }
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setAiError(null);
    setIsAiLoading(true);
    Keyboard.dismiss();

    try {
      const suggestions = await requestAIWriting({
        apiKey,
        template: aiTemplate,
        title,
        content,
        temperature: aiTemperature,
        maxTokens: aiMaxTokens,
        styleOf,
      });
      setAiSuggestions(suggestions);
      await persistAISettings();
    } catch (err: any) {
      if (err?.status === 429) {
        setAiError('Rate limit reached — try again shortly.');
      } else {
        setAiError('AI request failed. Check API key and network.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setUndoStack(prev => [...prev, content]);
    setContent(suggestion);
    setAiSuggestions([]);
    editorRef.current?.focus();
  };

  const undoSuggestion = () => {
    setUndoStack(prev => {
      if (!prev.length) {
        return prev;
      }
      const last = prev[prev.length - 1];
      setContent(last);
      return prev.slice(0, -1);
    });
  };

  useEffect(() => {
    if (!editPoem?.id) return;
    setEditingId(editPoem.id);
    setTitle(editPoem.title || '');
    setContent(editPoem.content || '');
    setSelectedThemes(editPoem.themes || []);
    setSelectedForm(editPoem.form || '');
    setActiveTemplate(getTemplateByForm(editPoem.form || ''));
  }, [editPoem]);

  const handlePublishPress = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to publish.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please write your poem before publishing.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please give your poem a title.');
      return;
    }
    setShowCategoryModal(true);
  };

  const handlePublish = async () => {
    if (!user) {
      return;
    }
    setIsPublishing(true);
    setShowCategoryModal(false);

    try {
      const authorName = user.email?.split('@')[0] || 'Unknown User';
      await upsertUserAuthor(user.id, authorName);

      if (editingId) {
        await updatePoem(editingId, user.id, {
          title: title.trim(),
          content: content.trim(),
          themes: selectedThemes.length > 0 ? selectedThemes : ['Other'],
          form: selectedForm || 'Free Verse',
        });
        setEditingId(null);
        setTitle('');
        setContent('');
        setSelectedThemes([]);
        setSelectedForm('');
        setActiveTemplate(undefined);
        setWordCount(0);
        setSyllableCount(0);
        await clearDraft(user.id);
        (navigation as { setParams?: (params: object) => void }).setParams?.({ editPoem: undefined });
        Alert.alert('Saved', 'Your poem was updated.');
        return;
      }

      const published = await publishPoemToDb(
        {
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
          themes: selectedThemes.length > 0 ? selectedThemes : ['Other'],
          form: selectedForm || 'Free Verse',
          visibility: 'public',
        },
        user.id,
      );

      await logActivity(user.id, 'published', 'poem', published.id, {
        title: published.title,
      });
      await saveVersion(
        user.id,
        { title, content, form: selectedForm },
        published.id,
      );

      setTitle('');
      setContent('');
      setSelectedThemes([]);
      setSelectedForm('');
      setActiveTemplate(undefined);
      setWordCount(0);
      setSyllableCount(0);
      await clearDraft(user.id);

      const v = await fetchVersions(user.id);
      setVersions(v);

      Alert.alert(
        'Your poem is live',
        'It is on the public feed now.',
        [
          { text: 'Write Another', style: 'cancel' },
          { text: 'Go to Read', onPress: () => navigation.navigate('Read') },
        ],
      );
    } catch (error) {
      console.error('publish error', error);
      Alert.alert('Error', 'Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme],
    );
  };

  const editorBg = darkMode ? colors.bgElevated : colors.bgCanvas;
  const headerHidden = focusMode;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: editorBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScreenContainer edges={[]} contentStyle={styles.editorSheet}>
        {!headerHidden && (
          <View style={[styles.folioCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
            <View style={styles.header}>
              <TextInput
                style={[styles.titleInput, { color: colors.textPrimary }]}
                placeholder={editingId ? 'Edit poem' : 'Poem title'}
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <View style={styles.headerActions}>
                {saveStatus === 'saved' && (
                  <Text style={[styles.savedText, { color: colors.success }]}>Saved</Text>
                )}
                <ToolButton label="Form" color={colors.textMuted} onPress={() => setShowTemplateModal(true)}>
                  <Ionicons name="document-text-outline" size={16} color={colors.brandPrimary} />
                </ToolButton>
                {versions.length > 0 && (
                  <ToolButton label="History" color={colors.textMuted} onPress={() => setShowVersionModal(true)}>
                    <Ionicons name="time-outline" size={16} color={colors.brandPrimary} />
                  </ToolButton>
                )}
                <ToolButton
                  label="Suggest"
                  color={colors.textMuted}
                  onPress={FEATURES.AI_ENABLED ? requestAISuggestions : undefined}
                  disabled={!FEATURES.AI_ENABLED || isAiLoading}
                >
                  <Ionicons name="sparkles-outline" size={16} color={FEATURES.AI_ENABLED ? colors.brandPrimary : colors.textSecondary} />
                </ToolButton>
                <ToolButton label="Focus" color={colors.textMuted} onPress={() => setFocusMode(true)}>
                  <Ionicons name="contract" size={16} color={colors.brandPrimary} />
                </ToolButton>
                <ToolButton
                  label={darkMode ? 'Day' : 'Night'}
                  color={colors.textMuted}
                  onPress={() => setDarkMode(!darkMode)}
                >
                  <Ionicons name={darkMode ? 'sunny-outline' : 'moon-outline'} size={16} color={colors.brandPrimary} />
                </ToolButton>
              </View>
            </View>
            <RichTextEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              onStatsChange={handleStatsChange}
              darkMode={darkMode}
              focusMode={focusMode}
              showToolbar={!focusMode}
            />
          </View>
        )}

        {focusMode && (
          <TouchableOpacity
            style={styles.exitFocus}
            onPress={() => setFocusMode(false)}
          >
            <Ionicons name="close" size={24} color={palette.glacial} />
          </TouchableOpacity>
        )}

        {focusMode && (
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            onStatsChange={handleStatsChange}
            darkMode={darkMode}
            focusMode={focusMode}
            showToolbar={!focusMode}
          />
        )}

        {!focusMode && (
          <>
            {activeTemplate && validation.hints.length > 0 && (
              <View style={[styles.hintBox, { backgroundColor: colors.bgElevated }]}>
                <Text style={[styles.hintTitle, { color: colors.brandSecondary }]}>{validation.message}</Text>
                {validation.hints.map((h, i) => (
                  <Text key={i} style={[styles.hintText, { color: colors.brandPrimary }]}>
                    • {h}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: colors.bgElevated,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.bodySm,
                    { color: colors.textSecondary },
                  ]}
                >
                  {wordCount} words · {syllableCount} syllables
                </Text>
              </View>
              {selectedForm && (
                <Text
                  style={[
                    theme.typography.bodySm,
                    { color: colors.brandPrimary, fontFamily: 'Inter-Bold' },
                  ]}
                >
                  {selectedForm}
                </Text>
              )}
            </View>

            <View style={styles.aiSection}>
              {FEATURES.AI_ENABLED ? (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.aiTemplates}
                  >
                    {AI_TEMPLATES.map(t => (
                      <TouchableOpacity
                        key={t.key}
                        style={[
                          styles.aiChip,
                          {
                            backgroundColor: colors.bgElevated,
                            borderColor: colors.borderSubtle,
                          },
                          aiTemplate === t.key && {
                            backgroundColor: colors.brandPrimary,
                            borderColor: colors.brandPrimary,
                          },
                        ]}
                        onPress={() => setAiTemplate(t.key)}
                      >
                        <Text
                          style={[
                            styles.aiChipText,
                            { color: colors.textPrimary },
                            aiTemplate === t.key && { color: colors.onBrand },
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {aiTemplate === 'rewrite_style' && (
                    <TextInput
                      style={[
                        styles.styleInput,
                        {
                          borderColor: colors.borderSubtle,
                          backgroundColor: colors.bgElevated,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={styleOf}
                      onChangeText={setStyleOf}
                      placeholder="Style of (e.g. Emily Dickinson)"
                      placeholderTextColor={colors.textMuted}
                    />
                  )}

                  <View style={styles.aiParams}>
                    <View style={styles.paramField}>
                      <Text style={[styles.paramLabel, { color: colors.textMuted }]}>Temp</Text>
                      <TextInput
                        style={[
                          styles.paramInput,
                          {
                            borderColor: colors.borderSubtle,
                            backgroundColor: colors.bgElevated,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={String(aiTemperature)}
                        keyboardType="numeric"
                        onChangeText={t =>
                          setAiTemperature(
                            Math.max(0, Math.min(1, parseFloat(t) || 0)),
                          )
                        }
                      />
                    </View>
                    <View style={styles.paramField}>
                      <Text style={[styles.paramLabel, { color: colors.textMuted }]}>Tokens</Text>
                      <TextInput
                        style={[
                          styles.paramInput,
                          {
                            borderColor: colors.borderSubtle,
                            backgroundColor: colors.bgElevated,
                            color: colors.textPrimary,
                          },
                        ]}
                        value={String(aiMaxTokens)}
                        keyboardType="numeric"
                        onChangeText={t =>
                          setAiMaxTokens(
                            Math.max(50, Math.min(2000, parseInt(t || '400'))),
                          )
                        }
                      />
                    </View>
                  </View>

                  {aiError && <Text style={styles.aiError}>{aiError}</Text>}

                  {aiSuggestions.length > 0 ? (
                    <View style={styles.suggestionsBox}>
                      <Text style={styles.suggestionsTitle}>
                        AI Suggestions
                      </Text>
                      {aiSuggestions.map((s, i) => (
                        <View key={i} style={styles.suggestionRow}>
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => applySuggestion(s)}
                          >
                            <Text
                              style={styles.suggestionText}
                              numberOfLines={8}
                            >
                              {s}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setPreviewText(s);
                              setPreviewModalVisible(true);
                            }}
                          >
                            <Text style={styles.previewLink}>Preview</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      <View style={styles.suggestionFooter}>
                        <TouchableOpacity onPress={() => setAiSuggestions([])}>
                          <Text style={styles.footerBtn}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={undoSuggestion}
                          disabled={!undoStack.length}
                        >
                          <Text
                            style={[
                              styles.footerBtn,
                              !undoStack.length && styles.footerDisabled,
                            ]}
                          >
                            Undo
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          </>
        )}

        {!focusMode && (
          <View
            style={[
              styles.publishBar,
              {
                backgroundColor: colors.bgSurface,
                borderTopColor: colors.borderMuted,
              },
            ]}
          >
            <Button
              title={isPublishing ? 'Saving...' : editingId ? 'Save changes' : 'Publish Poem'}
              onPress={handlePublishPress}
              variant="primary"
              loading={isPublishing}
              disabled={isPublishing}
              style={styles.publishBtnFull}
            />
          </View>
        )}
      </ScreenContainer>

      <TemplateSelector
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
        selectedForm={selectedForm}
      />

      <VersionHistoryModal
        visible={showVersionModal}
        versions={versions}
        onClose={() => setShowVersionModal(false)}
        onRestore={handleRestoreVersion}
      />

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Categorize Your Poem</Text>
              <Text style={styles.sectionTitle}>Themes (up to 3)</Text>
              <View style={styles.chipGrid}>
                {POEM_CATEGORIES.map(theme => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.bgCanvas,
                        borderColor: colors.borderSubtle,
                      },
                      selectedThemes.includes(theme) && {
                        backgroundColor: colors.brandPrimary,
                        borderColor: colors.brandPrimary,
                      },
                    ]}
                    onPress={() => toggleTheme(theme)}
                    disabled={
                      !selectedThemes.includes(theme) &&
                      selectedThemes.length >= 3
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.textSecondary },
                        selectedThemes.includes(theme) && {
                          color: colors.onBrand,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {theme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    isPublishing && styles.publishDisabled,
                  ]}
                  onPress={handlePublish}
                  disabled={isPublishing}
                >
                  <Text style={styles.confirmText}>
                    {isPublishing ? 'Saving...' : editingId ? 'Save changes' : 'Publish Poem'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {FEATURES.AI_ENABLED && (
        <Modal
          visible={showApiKeyModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowApiKeyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>OpenAI API Key</Text>
              <TextInput
                placeholder="sk-..."
                placeholderTextColor={palette.ghost}
                value={localApiKey}
                onChangeText={setLocalApiKey}
                style={styles.apiKeyInput}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowApiKeyModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={async () => {
                    await setApiKey(localApiKey);
                    setShowApiKeyModal(false);
                  }}
                >
                  <Text style={styles.confirmText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {FEATURES.AI_ENABLED && (
        <Modal
          visible={previewModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPreviewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Preview</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={styles.previewBody}>{previewText}</Text>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setPreviewModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => {
                    applySuggestion(previewText);
                    setPreviewModalVisible(false);
                  }}
                >
                  <Text style={styles.confirmText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  editorSheet: { flex: 1, minHeight: 0, paddingBottom: 0 },
  folioCard: { flex: 1, minHeight: 0, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, marginBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerActions: { flexDirection: 'row', alignItems: 'flex-start' },
  toolBtn: { width: 44, alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  toolCaption: { fontSize: 9, lineHeight: 12, fontWeight: '600', marginTop: 1 },
  iconBtn: { padding: 4 },
  savedText: { fontSize: 11, color: palette.emerald, fontWeight: '600' },
  publishButton: {
    backgroundColor: palette.jade,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
  },
  publishDisabled: { backgroundColor: palette.ghost },
  publishText: { color: palette.ink, fontWeight: '600' },
  exitFocus: { position: 'absolute', top: 8, right: 8, zIndex: 10, padding: 8 },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 6,
    color: palette.parchment,
  },
  titleInputDark: { color: palette.parchment },
  hintBox: {
    backgroundColor: palette.veil,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  hintTitle: { fontWeight: '600', color: palette.mint, marginBottom: 4 },
  hintText: { fontSize: 12, color: palette.emerald },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  publishBar: { padding: 16, borderTopWidth: 1, marginTop: 8 },
  publishBtnFull: { width: '100%' },
  aiSection: { marginTop: 4 },
  aiTemplates: { marginBottom: 8 },
  aiChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: palette.border,
    marginRight: 6,
  },
  aiChipActive: { backgroundColor: palette.emerald },
  aiChipText: { color: palette.parchment, fontWeight: '600', fontSize: 13 },
  aiChipTextActive: { color: palette.ink },
  styleInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: palette.spruce,
  },
  aiParams: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  paramField: { flex: 1 },
  paramLabel: { fontSize: 11, color: palette.ghost, marginBottom: 2 },
  paramInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: palette.spruce,
  },
  aiError: { color: palette.error, marginBottom: 6 },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.veil,
    padding: 12,
    borderRadius: 25,
    marginTop: 4,
  },
  aiButtonText: { marginLeft: 8, color: palette.emerald, fontWeight: '600' },
  suggestionsBox: {
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  suggestionsTitle: { fontWeight: 'bold', marginBottom: 8, color: palette.parchment },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  suggestionItem: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  suggestionText: { color: palette.onSurface, lineHeight: 22 },
  previewLink: { color: palette.emerald, fontWeight: '600', padding: 8 },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerBtn: { color: palette.emerald, fontWeight: '600' },
  footerDisabled: { color: palette.ghost },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: palette.spruce,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: palette.parchment,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: palette.parchment,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: palette.canvas,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: { backgroundColor: palette.emerald, borderColor: palette.emerald },
  chipText: { color: palette.glacial },
  chipTextSelected: { color: palette.ink, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: palette.border,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelText: { color: palette.ghost, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: palette.jade,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  confirmText: { color: palette.ink, fontWeight: '600' },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: palette.border,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    color: palette.parchment,
  },
  previewBody: { color: palette.onSurface, lineHeight: 24 },
});

export default WriteScreen;
