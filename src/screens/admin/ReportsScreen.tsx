import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AbuseReport, fetchPendingReports, updateReportStatus } from '../../services/abuseService';
import { useTheme } from '../../context/ThemeContext';

const ReportsScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAction = async (report: AbuseReport, status: 'reviewed' | 'dismissed' | 'actioned') => {
    try {
      await updateReportStatus(report.id, status);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      Alert.alert('Updated', `Report marked as ${status}.`);
    } catch {
      Alert.alert('Error', 'Could not update report.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={reports.length === 0 ? styles.center : styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No pending reports</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.type, { color: colors.primary }]}>
              {item.target_type.toUpperCase()}
            </Text>
            <Text style={[styles.reason, { color: colors.text }]}>{item.reason}</Text>
            {item.details && (
              <Text style={[styles.details, { color: colors.textSecondary }]}>{item.details}</Text>
            )}
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Target: {item.target_id.slice(0, 8)}…
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={() => handleAction(item, 'actioned')}
              >
                <Text style={styles.btnText}>Action</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.border }]}
                onPress={() => handleAction(item, 'dismissed')}
              >
                <Text style={[styles.btnText, { color: colors.text }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 16, gap: 12 },
  empty: { fontSize: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  type: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  reason: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  details: { fontSize: 14, marginBottom: 8 },
  meta: { fontSize: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
});

export default ReportsScreen;
