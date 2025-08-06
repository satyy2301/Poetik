// src/screens/ReadScreenWithTabs.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ReadScreen from './ReadScreen';
import CommunityScreen from './CommunityScree';
import { MaterialIcons } from '@expo/vector-icons';

const ReadScreenWithTabs = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'community'>('all');
  const { theme } = useTheme();
  const colors = theme.colors;

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityScreen />;
      case 'all':
      default:
        return <ReadScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Header */}
      <View style={[styles.tabHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'all' && { backgroundColor: colors.primary + '15' }
          ]}
          onPress={() => setActiveTab('all')}
        >
          <MaterialIcons 
            name="auto-stories" 
            size={20} 
            color={activeTab === 'all' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'all' ? colors.primary : colors.textSecondary }
          ]}>
            All Poems
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'community' && { backgroundColor: colors.primary + '15' }
          ]}
          onPress={() => setActiveTab('community')}
        >
          <MaterialIcons 
            name="people" 
            size={20} 
            color={activeTab === 'community' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'community' ? colors.primary : colors.textSecondary }
          ]}>
            Community
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
});

export default ReadScreenWithTabs;
