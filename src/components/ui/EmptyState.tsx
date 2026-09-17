import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const EmptyState = ({
  icon = 'document-text-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.cardHeaderTint }]}>
        <Ionicons name={icon} size={32} color={colors.brandPrimary} />
      </View>
      <Text style={[styles.title, theme.typography.emptyTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            styles.description,
            theme.typography.emptyDescription,
            { color: colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: 20,
  },
});

export default EmptyState;
