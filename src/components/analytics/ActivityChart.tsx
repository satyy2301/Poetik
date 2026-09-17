import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ActivityChartProps = {
  data: number[];
  labels?: string[];
};

const ActivityChart = ({ data, labels }: ActivityChartProps) => {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      <View style={styles.chartRow}>
        {data.map((value, index) => (
          <View key={index} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${(value / max) * 100}%` }]} />
            </View>
            <Text style={styles.barLabel}>{labels?.[index] || `D${index + 1}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#2c3e50', marginBottom: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  barTrack: {
    width: '80%',
    height: 80,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: '#0984e3', borderRadius: 6 },
  barLabel: { fontSize: 10, color: '#95a5a6', marginTop: 4 },
});

export default React.memo(ActivityChart);
