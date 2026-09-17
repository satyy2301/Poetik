import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ReadScreen from './ReadScreen';
import DiscoverScreen from './DiscoverScreen';

type ReadTab = 'all' | 'following' | 'discover';

const ReadScreenWithTabs = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [activeTab, setActiveTab] = useState<ReadTab>('all');

  const tabs: { key: ReadTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'following', label: 'Following' },
    { key: 'discover', label: 'Discover' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.textSecondary },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  header: { borderBottomWidth: 1 },
  tabRow: { flexDirection: 'row' },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontWeight: '600', fontSize: 15 },
  content: { flex: 1 },
});

export default ReadScreenWithTabs;
