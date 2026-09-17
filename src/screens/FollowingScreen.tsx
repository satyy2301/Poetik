import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFollowing, FollowUser } from '../services/followService';

const FollowingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = route.params?.userId;
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getFollowing(userId);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Not following anyone yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Profile', { user: { id: item.id, email: item.name } })}
          >
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name[0]}</Text></View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#9b59b6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: '700' },
  name: { fontWeight: '700', color: '#2c3e50' },
  bio: { color: '#7f8c8d', fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 40 },
});

export default FollowingScreen;
