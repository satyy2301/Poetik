import { Author } from './author';

export type PoemVisibility = 'public' | 'pending' | 'private' | 'rejected';

export type Poem = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  themes?: string[];
  form?: string | null;
  era?: string | null;
  like_count?: number;
  visibility?: PoemVisibility;
  source?: string | null;
  source_url?: string | null;
  language?: string | null;
  line_count?: number | null;
  word_count?: number | null;
  created_at?: string;
  updated_at?: string;
  author?: Author | { id: string; name: string };
};

export type PoemFilters = {
  era?: string | null;
  theme?: string | null;
  form?: string | null;
  authorId?: string | null;
  followingOnly?: boolean;
  followingIds?: string[];
};

export type PoemSort = 'newest' | 'popular' | 'random';

export type FetchPoemsParams = {
  limit?: number;
  page?: number;
  filters?: PoemFilters;
  sort?: PoemSort;
};

export type FetchPoemsResult = {
  poems: Poem[];
  hasMore: boolean;
};

export type SearchPoemsParams = {
  query: string;
  form?: string | null;
  theme?: string | null;
  authorId?: string | null;
  limit?: number;
};

export type PoemVersion = {
  id: string;
  poem_id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  created_at?: string;
  reviewed_at?: string | null;
};
