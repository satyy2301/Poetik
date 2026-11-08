import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ReadScreen from './ReadScreen';
import DiscoverScreen from './DiscoverScreen';

type ReadTab = 'all' | 'following' | 'discover';

const ReadScreenWithTabs = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ReadTab>('all');

  const tabs: { key: ReadTab; label: string }[] = [
    { key: 'all', label: 'ALL POEMS' },
    { key: 'following', label: 'FOLLOWING' },
    { key: 'discover', label: 'DISCOVER' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderMuted }]}>
        <Text style={[theme.typography.headerTitle, { color: colors.textPrimary, letterSpacing: 2 }]}>POETIK</Text>
        <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>READ</Text>
      </View>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? 'rgba(16, 185, 129, 0.15)' : colors.bgSurface,
                  borderColor: active ? colors.brandPrimary : colors.borderMuted,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[theme.typography.labelMono, { color: active ? colors.brandSecondary : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'discover' ? (
          <DiscoverScreen />
        ) : (
          <ReadScreen feedMode={activeTab} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  content: { flex: 1 },
});

export default ReadScreenWithTabs;
