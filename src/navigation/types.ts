import { Author } from '../types/author';
import { Poem } from '../types/poem';

export type RootStackParamList = {
  App: undefined;
  MainTabs: undefined;
  Write: undefined;
  Read: undefined;
  Learn: undefined;
  Auth: undefined;
  Search: undefined;
  Profile: { user?: { id: string; email?: string } };
  AuthorProfile: { author?: Author; authorId?: string };
  PoemDetail: { poem?: Poem; poemId?: string };
  PlaylistDetail: { playlist?: { id: string; title?: string }; playlistId?: string };
  Playlists: undefined;
  PublicPlaylist: { slug: string };
  Followers: { userId: string };
  Following: { userId: string };
  Notifications: undefined;
  ActivityFeed: undefined;
  Chat: { userId: string; name?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
