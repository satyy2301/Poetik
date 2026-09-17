import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ComingSoonBannerProps = {
  message?: string;
  compact?: boolean;
};

const ComingSoonBanner = ({
  message = 'AI features will return in a future update.',
  compact = false,
}: ComingSoonBannerProps) => {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>Coming soon</Text>
      <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    padding: 16,
    alignItems: 'center',
  },
  compact: {
    padding: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#636e72',
    marginBottom: 6,
  },
  titleCompact: {
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageCompact: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ComingSoonBanner;
