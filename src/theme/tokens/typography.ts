import { TextStyle } from 'react-native';

export const fontFamilies = {
  interRegular: 'Inter-Regular',
  interBold: 'Inter-Bold',
  newsreader: 'Newsreader-Regular',
  newsreaderItalic: 'Newsreader-Italic',
  mono: 'JetBrainsMono-Medium',
  playfair: 'Newsreader-Regular',
  playfairRegular: 'Newsreader-Regular',
};

export const typography = {
  displayLg: {
    fontFamily: fontFamilies.newsreader,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  displaySm: {
    fontFamily: fontFamilies.newsreader,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  poemTitle: {
    fontFamily: fontFamilies.newsreader,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  poemBody: {
    fontFamily: fontFamilies.newsreaderItalic,
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMd: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySm: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  labelBold: {
    fontFamily: fontFamilies.interBold,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  labelMono: {
    fontFamily: fontFamilies.mono,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.8,
  },
  statNumber: {
    fontFamily: fontFamilies.mono,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  headerTitle: {
    fontFamily: fontFamilies.newsreader,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  emptyTitle: {
    fontFamily: fontFamilies.newsreader,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  emptyDescription: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
};
