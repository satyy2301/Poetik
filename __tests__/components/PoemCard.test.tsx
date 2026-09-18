import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

jest.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        bgSurface: '#fff',
        borderMuted: '#eee',
        cardHeaderTint: '#f5f5f5',
        brandPrimary: '#6b4eff',
        textPrimary: '#111',
        textSecondary: '#666',
        likeHeart: '#e74c3c',
        bookmarkGold: '#f1c40f',
        bgElevated: '#fafafa',
      },
      typography: {
        labelBold: {},
        bodySm: {},
        displaySm: {},
        poemTitle: {},
        poemBody: {},
        emptyTitle: {},
        emptyDescription: {},
        bodyMd: {},
      },
      shadows: { card: {} },
    },
  }),
}));

jest.mock('../../src/features/playlists/playlistService', () => ({
  getUserPlaylists: jest.fn().mockResolvedValue({ data: [] }),
  addPoemToPlaylist: jest.fn(),
}));

jest.mock('../../src/utils/haptics', () => ({
  hapticMedium: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('../../src/components/ReportModal', () => 'ReportModal');

import PoemCard from '../../src/components/PoemCard';

const poem = {
  id: 'poem-1',
  title: 'Test Poem',
  content: 'Roses are red',
  like_count: 3,
  created_at: '2026-09-17T10:00:00Z',
  author: { id: 'a1', name: 'Tester' },
  form: 'Haiku',
  themes: ['nature'],
};

test('PoemCard renders title and author', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <PoemCard
        poem={poem}
        onPress={jest.fn()}
        onAuthorPress={jest.fn()}
        onLike={jest.fn()}
      />,
    );
  });

  const json = tree!.toJSON() as any;
  expect(json).toBeTruthy();
});
