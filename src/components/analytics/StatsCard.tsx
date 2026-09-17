import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatsCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

const StatsCard = ({ label, value, accent = '#3498db' }: StatsCardProps) => (
  <View style={[styles.card, { borderLeftColor: accent }]}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    marginHorizontal: 4,
  },
  value: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  label: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
});

export default React.memo(StatsCard);
