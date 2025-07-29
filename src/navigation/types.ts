// src/navigation/types.ts
export type RootStackParamList = {
  Write: undefined;
  Read: undefined;
  Auth: undefined;
  // Add all your screen names here
};

// This helps with TypeScript inference for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}