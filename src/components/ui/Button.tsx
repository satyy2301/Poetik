import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'compact';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.brandPrimary },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: {
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
      },
      text: { color: colors.textPrimary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.brandPrimary },
    },
    danger: {
      container: {
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        borderWidth: 1,
        borderColor: colors.likeHeart,
      },
      text: { color: colors.likeHeart },
    },
  };

  const sizeStyles = {
    default: { height: 44, paddingHorizontal: 16, paddingVertical: 10 },
    compact: { height: 36, paddingHorizontal: 12, paddingVertical: 6 },
  };

  const current = variantStyles[variant];
  const spinnerColor = variant === 'primary' ? '#FFFFFF' : colors.brandPrimary;

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        sizeStyles[size],
        current.container,
        isDisabled && styles.disabled,
        Platform.OS === 'web' && styles.webCursor,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, theme.typography.labelBold, current.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
  },
  label: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  webCursor: {
    cursor: 'pointer',
  } as ViewStyle,
});

export default Button;
