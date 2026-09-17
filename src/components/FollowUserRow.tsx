import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FollowUser } from '../services/followService';
import { hapticLight } from '../utils/haptics';

type Props = {
  user: FollowUser;
  colors: {
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    background: string;
  };
  actionLabel?: string;
  actionVariant?: 'primary' | 'secondary';
  onPress: () => void;
  onAction?: () => void;
  actionLoading?: boolean;
};

const FollowUserRow = ({
  user,
  colors,
  actionLabel,
  actionVariant = 'primary',
  onPress,
  onAction,
  actionLoading,
}: Props) => (
  <TouchableOpacity
    style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {user.avatar_url ? (
      <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
    ) : (
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
    )}
    <View style={styles.info}>
      <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
      {user.bio ? (
        <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={1}>
          {user.bio}
        </Text>
      ) : null}
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity
        style={[
          styles.actionBtn,
          actionVariant === 'secondary'
            ? { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }
            : { backgroundColor: colors.primary },
        ]}
        onPress={() => { hapticLight(); onAction(); }}
        disabled={actionLoading}
      >
        <Text
          style={[
            styles.actionText,
            { color: actionVariant === 'secondary' ? colors.text : '#fff' },
          ]}
        >
          {actionLabel}
        </Text>
      </TouchableOpacity>
    ) : (
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 16 },
  info: { flex: 1, marginRight: 8 },
  name: { fontWeight: '700', fontSize: 15 },
  bio: { fontSize: 13, marginTop: 2 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionText: { fontWeight: '600', fontSize: 13 },
});

export default FollowUserRow;
