import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type ScreenContainerProps = {
  children: React.ReactNode;
  maxWidth?: number;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

const ScreenContainer = ({
  children,
  maxWidth,
  scrollable = false,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const resolvedMaxWidth = maxWidth ?? theme.layout.feedMaxWidth;

  const paddingStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const columnStyle: ViewStyle = {
    width: '100%',
    maxWidth: resolvedMaxWidth,
    alignSelf: 'center',
    minWidth: 0,
  };

  const paddedStyle: ViewStyle = {
    width: '100%',
    minWidth: 0,
    paddingHorizontal: theme.spacing.lg,
    ...contentStyle,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    width: '100%',
    minWidth: 0,
    backgroundColor: theme.colors.bgCanvas,
    ...paddingStyle,
    ...style,
  };

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[columnStyle, styles.grow]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[paddedStyle, styles.grow]}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={[columnStyle, styles.fill]}>
        <View style={[paddedStyle, styles.fill]}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1, minWidth: 0, width: '100%' },
  grow: { flexGrow: 1 },
});

export default ScreenContainer;
