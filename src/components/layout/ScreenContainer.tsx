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

  const innerStyle: ViewStyle = {
    flex: 1,
    width: '100%',
    maxWidth: resolvedMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...contentStyle,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.bgCanvas,
    ...paddingStyle,
    ...style,
  };

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={[innerStyle, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={innerStyle}>{children}</View>
    </View>
  );
};

export default ScreenContainer;
