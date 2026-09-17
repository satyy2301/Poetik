import { NavigationProp } from '@react-navigation/native';
import { Author } from '../types/author';
import { Poem } from '../types/poem';
import { getPoemById } from '../services/poemService';

type Nav = NavigationProp<Record<string, object | undefined>>;

export const openPoemDetail = async (
  navigation: Nav,
  poemOrId: Poem | string,
) => {
  if (typeof poemOrId === 'string') {
    navigation.navigate('PoemDetail', { poemId: poemOrId });
    return;
  }
  if (poemOrId.title && poemOrId.content) {
    navigation.navigate('PoemDetail', { poem: poemOrId });
    return;
  }
  if (poemOrId.id) {
    navigation.navigate('PoemDetail', { poemId: poemOrId.id });
  }
};

export const openAuthorProfile = (
  navigation: Nav,
  authorOrId: Author | string,
) => {
  if (typeof authorOrId === 'string') {
    navigation.navigate('AuthorProfile', { authorId: authorOrId });
    return;
  }
  navigation.navigate('AuthorProfile', {
    author: authorOrId,
    authorId: authorOrId.id,
  });
};

export const openUserProfile = (
  navigation: Nav,
  userId: string,
  currentUserId?: string,
) => {
  if (currentUserId && userId === currentUserId) {
    navigation.navigate('Profile');
    return;
  }
  navigation.navigate('AuthorProfile', { authorId: userId });
};

export const openPlaylistDetail = (
  navigation: Nav,
  playlist: { id: string; title?: string },
) => {
  navigation.navigate('PlaylistDetail', { playlist });
};

export const openChat = (
  navigation: any,
  recipientUserId: string,
  recipientName?: string,
) => {
  const params = { userId: recipientUserId, name: recipientName };
  const state = navigation.getState?.();
  const routes: string[] = state?.routeNames ?? [];
  if (routes.includes('Chat')) {
    navigation.navigate('Chat', params);
    return;
  }
  if (routes.includes('App')) {
    navigation.navigate('App', { screen: 'Chat', params });
    return;
  }
  const parent = navigation.getParent?.();
  if (parent) {
    parent.navigate('Chat', params);
  }
};

export const resolvePoemForDetail = async (
  poem?: Poem,
  poemId?: string,
): Promise<Poem | null> => {
  if (poem?.title && poem?.content) return poem;
  const id = poemId || poem?.id;
  if (!id) return null;
  return getPoemById(id);
};
