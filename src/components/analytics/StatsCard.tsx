import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../../theme/tokens/colors';

type StatsCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

const StatsCard = ({ label, value, accent = palette.emerald }: StatsCardProps) => (
  <View style={[styles.card, { borderLeftColor: accent }]}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.spruce,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    marginHorizontal: 4,
  },
  value: { fontSize: 22, fontWeight: '700', color: palette.parchment },
  label: { fontSize: 12, color: palette.glacial, marginTop: 4 },
});

export default React.memo(StatsCard);
