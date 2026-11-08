import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type FolioHeaderProps = {
  kicker: string;
  title: string;
  sentence: string;
};

const FolioHeader = ({ kicker, title, sentence }: FolioHeaderProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View style={styles.wrap}>
      <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>{kicker}</Text>
      <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginTop: 4 }]}>{title}</Text>
      <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>{sentence}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
});

export default FolioHeader;
