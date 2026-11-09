import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import ReadScreen from './ReadScreen';
import DiscoverScreen from './DiscoverScreen';

type ReadTab = 'all' | 'following' | 'discover';

const TABS: { key: ReadTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'following', label: 'Following' },
  { key: 'discover', label: 'Discover' },
];

const ReadScreenWithTabs = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<ReadTab>('all');

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.headerTitle, styles.title, { color: colors.textPrimary }]}>Read</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.brandPrimary }]}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn} accessibilityLabel="Search">
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn} accessibilityLabel="Profile">
            <MaterialIcons name="account-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.segment, { backgroundColor: colors.bgSurface }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentItem, active && { backgroundColor: colors.bgCanvas }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.segmentLabel, { color: active ? colors.textPrimary : colors.textSecondary }]}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 8,
    height: 44,
  },
  title: { fontSize: 22, lineHeight: 26 },
  icons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#F4FBF7', fontSize: 9, fontWeight: '700' },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    borderRadius: 8,
  },
  segmentLabel: { fontSize: 13, fontWeight: '600' },
  content: { flex: 1 },
});

export default ReadScreenWithTabs;
