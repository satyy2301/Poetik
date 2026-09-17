# Row Level Security Policies

Run `supabase/migrations/008_rls_policies.sql` after prior migrations.

## Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| poems | public + own | own author | own author | own author |
| authors | everyone | own profile | own profile | — |
| poem_versions | own + pending | own | reviewers | — |
| user_lessons | own | own | own | own |
| user_progress | own | own | own | own |
| lessons | everyone | — | — | — |
| quizzes | everyone | — | — | — |
| followers | everyone | self as follower | — | self as follower |
| messages | sender/receiver | sender | sender/receiver | — |
| playlists | own + public | own | own | own |
| user_favorite_poems | own | own | own | own |
| user_favorite_poets | own | own | own | own |
| notifications | own | system | own | — |
| poem_drafts | own | own | own | own |

## Testing

1. Sign in as User A — verify cannot read User B's drafts or progress.
2. Publish poem as User A — verify visible when `visibility = public` after approval.
3. Send message A→B — verify B can read, User C cannot.
4. Follow user — verify follower row uses `auth.uid()` as `follower_id`.
