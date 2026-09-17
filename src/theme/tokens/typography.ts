import { TextStyle } from 'react-native';

export const fontFamilies = {
  interRegular: 'Inter-Regular',
  interBold: 'Inter-Bold',
  playfair: 'PlayfairDisplay-VariableFont_wght',
  playfairRegular: 'PlayfairDisplay-Regular',
};

export const typography = {
  displayLg: {
    fontFamily: fontFamilies.playfair,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  displaySm: {
    fontFamily: fontFamilies.playfair,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  poemTitle: {
    fontFamily: fontFamilies.playfair,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  poemBody: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMd: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySm: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  labelBold: {
    fontFamily: fontFamilies.interBold,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  statNumber: {
    fontFamily: fontFamilies.interBold,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  headerTitle: {
    fontFamily: fontFamilies.playfair,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  emptyTitle: {
    fontFamily: fontFamilies.interBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  emptyDescription: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
};
