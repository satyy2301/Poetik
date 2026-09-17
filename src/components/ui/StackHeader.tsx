import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type StackHeaderProps = {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  backIcon?: 'arrow-back' | 'close';
  rightActions?: React.ReactNode;
  useSerif?: boolean;
};

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const StackHeader = ({
  title,
  onBack,
  onClose,
  backIcon = 'arrow-back',
  rightActions,
  useSerif = false,
}: StackHeaderProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleLeft = onClose ?? onBack;

  return (
    <View style={[styles.header, { borderBottomColor: colors.borderMuted }]}>
      <View style={styles.side}>
        {handleLeft ? (
          <TouchableOpacity
            onPress={handleLeft}
            hitSlop={HIT_SLOP}
            style={Platform.OS === 'web' ? styles.webCursor : undefined}
          >
            <Ionicons
              name={onClose ? 'close' : backIcon}
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text
        style={[
          styles.title,
          useSerif ? theme.typography.headerTitle : theme.typography.labelBold,
          { color: colors.textPrimary },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.side}>{rightActions ?? <View style={styles.placeholder} />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  webCursor: Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : {},
});

export default StackHeader;
