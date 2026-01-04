// src/navigation/types.ts
export type RootStackParamList = {
  MainTabs: undefined;
  Write: undefined;
  Read: undefined;
  Learn: undefined;
  Auth: undefined;
  Search: undefined;
  Profile: { user?: any };
  AuthorProfile: { author: any };
  PoemDetail: { poem: any };
  PlaylistDetail: { playlist: any };
  Playlists: undefined;
  // Add all your screen names here
};

// This helps with TypeScript inference for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}