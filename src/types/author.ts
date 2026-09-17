export type Author = {
  id: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  birth_year?: number | null;
  death_year?: number | null;
  canonical?: boolean;
  user_id?: string | null;
  created_at?: string;
};

export type AuthorStats = {
  totalPoems: number;
  totalLikes: number;
  themes: string[];
  mostUsedForm: string;
};
