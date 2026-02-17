# Poetik App - Complete Sprint Roadmap
## 3-Month Development Plan to Play Store Launch

**Project Goal:** Build a comprehensive poetry learning and community platform with AI-powered features, scalable architecture, and production-ready quality for Play Store release.

**Timeline:** 12 weeks (3 months)  
**Team:** Solo developer (@satyy2301)  
**Target:** Play Store production release

---

## 📋 Sprint Overview

| Sprint | Duration | Focus Area | Key Deliverables |
|--------|----------|------------|------------------|
| Sprint 0 | Week 1 | Stabilization | Fix bugs, navigation, auth, DB setup |
| Sprint 1 | Week 2 | Poems Database | Schema, ingestion, author profiles |
| Sprint 2 | Week 3-4 | Learn Core | Lessons, progress, quizzes |
| Sprint 3 | Week 5-6 | AI Integration | OpenAI proxy, lesson/quiz generation |
| Sprint 4 | Week 7-8 | Learn Polish | Gamification, badges, UX |
| Sprint 5 | Week 9 | Write Enhancements | Rich editor, AI tools |
| Sprint 6 | Week 10 | Social Features | Follow, messaging, discovery |
| Sprint 7 | Week 11 | Production Prep | Security, performance, testing |
| Sprint 8 | Week 12 | Play Store Launch | Final QA, submission, monitoring |

---

## Sprint 0: Stabilization & Foundation
**Duration:** Week 1 (5 days)  
**Status:** ✅ COMPLETED

### Goals
- Fix all build-blocking errors
- Ensure navigation works end-to-end
- Stabilize auth flows
- Prepare database migrations
- Create demo-ready baseline

### Tasks Completed

#### Task 1: Fix Syntax Errors & Imports ✅
**Estimate:** 3 hours  
**Subtasks:**
- [x] Remove stray diff markers from MessagesScreen
- [x] Fix messagingService import/export alignment
- [x] Verify web bundler passes without errors
- [x] Test on both web and native

**Files Changed:**
- `src/screens/MessagesScreen.tsx`
- `src/features/messaging/messagingService.ts`

**Acceptance:** Expo builds successfully on web without SyntaxError

---

#### Task 2: Register Missing Learn Screens ✅
**Estimate:** 3 hours  
**Subtasks:**
- [x] Create `ChallengeDetailScreen.tsx` stub
- [x] Create `QuizListScreen.tsx` stub
- [x] Create `AITutorScreen.tsx` stub
- [x] Use existing `LessonsDetailScreen.tsx` for LessonDetail
- [x] Import and register all screens in `AppNavigator.tsx`
- [x] Test navigation from LearnScreen

**Files Created:**
- `src/screens/ChallengeDetailScreen.tsx`
- `src/screens/QuizListScreen.tsx`
- `src/screens/AITutorScreen.tsx`

**Files Modified:**
- `src/navigation/AppNavigator.tsx`

**Acceptance:** No navigation warnings; all Learn screens reachable

---

#### Task 3: Fix Auth Flows ✅
**Estimate:** 4 hours  
**Subtasks:**
- [x] Audit `AuthContext.tsx` onAuthStateChange handling
- [x] Ensure users row created on signUp
- [x] Implement getOrCreateUser helper
- [x] Ensure logout clears local state
- [x] Navigate to Auth stack on logout
- [x] Test signup → login → logout flows

**Files Modified:**
- `src/context/AuthContext.tsx`

**Acceptance:** User row exists in DB after signup; logout returns to auth screen

---

#### Task 4: Apply SQL Migrations ✅
**Estimate:** 2 hours  
**Subtasks:**
- [x] Review `supabase/schema/lessons.sql`
- [x] Create migration for lessons, user_lessons, daily_challenges, user_progress
- [x] Add typing_status table for messaging
- [x] Document manual SQL execution steps

**Files Created:**
- `supabase/schema/lessons.sql`
- `supabase/schema/seed_lessons.sql`

**Acceptance:** SQL files ready; tables created in Supabase (manual run)

---

#### Task 5: Seed Sample Lessons ✅
**Estimate:** 4 hours  
**Subtasks:**
- [x] Research 10 poetry lesson topics
- [x] Create lesson JSON with steps (theory, example, exercise)
- [x] Implement seed button in LearnScreen
- [x] Use `supabase.from('lessons').insert()`
- [x] Verify lessons appear in UI

**Files Created:**
- `src/data/seedLessons.ts`

**Files Modified:**
- `src/screens/LearnScreen.tsx`

**Acceptance:** 10 lessons visible in Learn screen after seeding

---

#### Task 6: Replace RPC Seeding ✅
**Estimate:** 2 hours  
**Subtasks:**
- [x] Find all `rpc('sql')` calls
- [x] Replace with direct inserts
- [x] Remove failing RPC endpoints
- [x] Test seeding flow

**Files Modified:**
- `src/screens/LearnScreen.tsx`

**Acceptance:** No PGRST202 errors; seeding works via client insert

---

#### Task 7: Guard WriteScreen Formatting ✅
**Estimate:** 3 hours  
**Subtasks:**
- [x] Add platform checks for setSelection
- [x] Implement setNativeProps fallback
- [x] Add focus() fallback for web
- [x] Wrap in try/catch
- [x] Test bold/italic on web and native

**Files Modified:**
- `src/screens/WriteScreen.tsx`

**Acceptance:** No crashes on web; formatting works or fails gracefully

---

#### Task 8: Finalize MessagesScreen ✅
**Estimate:** 4 hours  
**Subtasks:**
- [x] Verify messagingService exports
- [x] Implement subscribeToMessages in useEffect
- [x] Implement subscribeToTyping
- [x] Add cleanup in useEffect return
- [x] Implement optimistic send (temp ID)
- [x] Implement message reconciliation
- [x] Test realtime updates

**Files Modified:**
- `src/screens/MessagesScreen.tsx`
- `src/features/messaging/messagingService.ts`

**Acceptance:** Messages send and receive in realtime; typing indicators work

---

#### Task 9: Smoke Test & Demo ✅
**Estimate:** 3 hours  
**Subtasks:**
- [x] Test signup/login/logout
- [x] Test Read feed and author navigation
- [x] Test Learn course navigation
- [x] Test Write formatting and AI suggest
- [x] Test Messages send/receive
- [x] Create demo script (5-7 minutes)
- [x] Take screenshots

**Deliverable:**
- Demo script ready for interview
- All core flows verified

**Acceptance:** Complete demo runs without errors

---

#### Task 10: CI Workflow (Optional) ⏳
**Estimate:** 4 hours  
**Status:** Moved to Sprint 1  
**Subtasks:**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure eslint job
- [ ] Configure jest test job
- [ ] Fix any lint/test failures
- [ ] Test PR workflow

**Acceptance:** PRs run lint and tests automatically

---

#### Task 11: Documentation ✅
**Estimate:** 2 hours  
**Subtasks:**
- [x] Update `NEW_FEATURES.md`
- [x] Create Sprint 0 summary
- [x] Document completion status
- [x] Create project board structure

**Files Modified:**
- `NEW_FEATURES.md`

**Acceptance:** Documentation complete and accurate

---

### Sprint 0 Metrics
- **Planned tasks:** 11
- **Completed:** 10 (CI moved to Sprint 1)
- **Duration:** 5 days
- **Blockers:** 0
- **Critical bugs fixed:** 3 (imports, navigation, auth)

---

## Sprint 1: Poems Database & Author Profiles
**Duration:** Week 2 (5 days)  
**Status:** 🔄 NEXT

### Goals
- Build scalable poems database
- Implement author profiles
- Create ingestion pipeline for public domain poems
- Add full-text search
- Enhance Read screen UX

### Task 1.1: Design Poems/Authors Schema
**Estimate:** 4 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design `poems` table (id, title, body, author_id, themes, form, visibility, created_at)
- [ ] Design `authors` table (id, name, bio, birth_year, death_year, canonical, created_at)
- [ ] Design `poem_versions` table for user edits/moderation
- [ ] Add full-text search column (tsvector)
- [ ] Add indexes for performance (GIN, B-tree)
- [ ] Design RLS policies (public read, authenticated write)
- [ ] Create migration file

**Files to Create:**
- `supabase/migrations/001_poems_authors.sql`

**Acceptance Criteria:**
- Schema supports both canonical and user-generated poems
- Full-text search ready
- RLS policies defined

---

### Task 1.2: Implement Poems Ingestion Pipeline
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Research public domain sources (Project Gutenberg, Poetry Foundation)
- [ ] Create ingestion script (`scripts/ingestPoems.ts`)
- [ ] Parse and normalize poem data
- [ ] Handle author creation/lookup
- [ ] Batch insert poems (100 at a time)
- [ ] Add error handling and logging
- [ ] Ingest 500+ poems for demo

**Files to Create:**
- `scripts/ingestPoems.ts`
- `scripts/sources/gutenberg.ts`
- `scripts/sources/poetrydb.ts`

**Acceptance Criteria:**
- 500+ poems in database
- Authors properly linked
- No duplicate poems

---

### Task 1.3: Build Author Profile Screen
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Create `AuthorProfileScreen.tsx`
- [ ] Fetch author data with poem count
- [ ] Display bio, dates, stats
- [ ] Show list of author's poems (paginated)
- [ ] Add "Follow Author" button (future)
- [ ] Add loading and error states
- [ ] Style with consistent theme

**Files to Create:**
- `src/screens/AuthorProfileScreen.tsx`
- `src/services/authorService.ts`

**Files to Modify:**
- `src/navigation/AppNavigator.tsx` (register screen)
- `src/components/PoemCard.tsx` (make author name clickable)

**Acceptance Criteria:**
- Clicking author name opens profile
- Profile shows bio and poems
- Pagination works

---

### Task 1.4: Implement Full-Text Search
**Estimate:** 5 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Add tsvector column to poems table
- [ ] Create trigger to auto-update search column
- [ ] Implement `searchPoems` function in service
- [ ] Add debounced search in `SearchScreen`
- [ ] Support filters (author, form, themes)
- [ ] Add search highlighting (optional)
- [ ] Test search performance (<300ms)

**Files to Modify:**
- `supabase/migrations/002_full_text_search.sql`
- `src/screens/SearchScreen.tsx`
- `src/services/poemService.ts`

**Acceptance Criteria:**
- Search returns results <300ms
- Filters work correctly
- Handles typos gracefully

---

### Task 1.5: Enhance Read Screen Feed
**Estimate:** 6 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Implement cursor-based pagination
- [ ] Add infinite scroll (FlatList)
- [ ] Optimize PoemCard rendering (React.memo)
- [ ] Add filters (by form, theme, author)
- [ ] Add sort options (newest, popular, random)
- [ ] Implement pull-to-refresh
- [ ] Test with 1000+ poems

**Files to Modify:**
- `src/screens/ReadScreen.tsx`
- `src/components/PoemCard.tsx`
- `src/services/poemService.ts`

**Acceptance Criteria:**
- Smooth scrolling with 1000+ poems
- Pagination works correctly
- Filters apply instantly

---

### Task 1.6: Add Poem Moderation Queue
**Estimate:** 4 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Create `poem_versions` table workflow
- [ ] Implement submit-for-review flow
- [ ] Create admin moderation UI (basic)
- [ ] Add approval/rejection logic
- [ ] Send notifications (future)

**Files to Create:**
- `src/screens/admin/ModerationQueueScreen.tsx`
- `src/services/moderationService.ts`

**Acceptance Criteria:**
- User poems go to pending status
- Admin can approve/reject
- Approved poems visible to all

---

### Sprint 1 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 33
- **Priority breakdown:** 3 HIGH, 2 MEDIUM, 1 LOW
- **Dependencies:** Task 1.1 → 1.2 → 1.3

---

## Sprint 2: Learn Core Features
**Duration:** Week 3-4 (10 days)  
**Status:** 📅 PLANNED

### Goals
- Build interactive lesson detail screen
- Implement progress tracking (XP, levels, streaks)
- Create quiz system with scoring
- Implement daily challenges
- Build responsive Learn UX

### Task 2.1: Build Interactive Lesson Detail
**Estimate:** 10 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Parse JSONB steps and render components
- [ ] Create step types: theory, example, exercise, quiz
- [ ] Implement step navigation (prev/next)
- [ ] Add progress indicator (step X of Y)
- [ ] Handle user input for exercises
- [ ] Store lesson progress in `user_lessons`
- [ ] Mark lessons as completed
- [ ] Add animations between steps

**Files to Modify:**
- `src/screens/LessonsDetailScreen.tsx`
- `src/components/LessonStep.tsx`

**Files to Create:**
- `src/components/lesson-steps/TheoryStep.tsx`
- `src/components/lesson-steps/ExampleStep.tsx`
- `src/components/lesson-steps/ExerciseStep.tsx`
- `src/components/lesson-steps/QuizStep.tsx`

**Acceptance Criteria:**
- All step types render correctly
- Navigation works smoothly
- Progress saved to database

---

### Task 2.2: Implement Progress Tracking System
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Create XP calculation logic
- [ ] Implement level progression (100 XP per level)
- [ ] Build ProgressContext with XP state
- [ ] Update XP on lesson completion
- [ ] Create ProgressBar component with animations
- [ ] Display current level in header
- [ ] Add XP gain animations (toast/modal)
- [ ] Sync progress to `user_progress` table

**Files to Create:**
- `src/context/ProgressContext.tsx` (already exists, enhance)
- `src/components/ProgressBar.tsx` (already exists, enhance)
- `src/components/XPGainToast.tsx`
- `src/utils/xpCalculator.ts`

**Acceptance Criteria:**
- XP updates correctly on completion
- Level progression works
- Progress persists across sessions

---

### Task 2.3: Build Quiz System
**Estimate:** 12 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design quiz schema (questions, options, correct_answer)
- [ ] Create `quizzes` table
- [ ] Build QuizScreen component
- [ ] Implement question rendering (MCQ, True/False, Fill-in)
- [ ] Add answer validation
- [ ] Calculate and display score
- [ ] Award XP based on performance
- [ ] Store quiz results in `user_quiz_results`
- [ ] Add retry logic

**Files to Create:**
- `src/screens/QuizDetailScreen.tsx`
- `src/components/QuizQuestion.tsx`
- `src/services/quizService.ts`
- `supabase/migrations/003_quizzes.sql`

**Files to Modify:**
- `src/screens/QuizListScreen.tsx` (enhance stub)

**Acceptance Criteria:**
- Quizzes render and function correctly
- Scoring accurate
- Results saved to DB

---

### Task 2.4: Implement Daily Challenges
**Estimate:** 6 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create daily challenge generation logic
- [ ] Seed 30 days of challenges
- [ ] Build challenge UI card
- [ ] Implement challenge submission
- [ ] Award bonus XP for completion
- [ ] Add streak tracking (consecutive days)
- [ ] Show today's challenge prominently

**Files to Modify:**
- `src/screens/LearnScreen.tsx` (enhance daily tab)
- `src/screens/ChallengeDetailScreen.tsx` (enhance stub)

**Files to Create:**
- `src/services/challengeService.ts`
- `scripts/seedChallenges.ts`

**Acceptance Criteria:**
- New challenge appears daily
- Completion awards XP
- Streak counter works

---

### Task 2.5: Build Course Progression UI
**Estimate:** 6 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create CourseCard with progress ring
- [ ] Show completed lessons count
- [ ] Add "locked" state for prerequisites
- [ ] Implement course prerequisites logic
- [ ] Add course completion certificate (modal)
- [ ] Style with animations

**Files to Modify:**
- `src/components/LessonCard.tsx` (rename to CourseCard)
- `src/screens/LearnScreen.tsx`

**Files to Create:**
- `src/components/ProgressRing.tsx`
- `src/components/CourseCertificate.tsx`

**Acceptance Criteria:**
- Progress rings accurate
- Prerequisites enforced
- Certificate awarded on completion

---

### Task 2.6: Add Learn Analytics Dashboard
**Estimate:** 5 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Create Progress tab in LearnScreen
- [ ] Show total XP, level, lessons completed
- [ ] Display weekly activity chart
- [ ] Show favorite poetry forms
- [ ] Add achievements preview
- [ ] Calculate learning streak

**Files to Modify:**
- `src/screens/LearnScreen.tsx` (Progress tab)

**Files to Create:**
- `src/components/analytics/ActivityChart.tsx`
- `src/components/analytics/StatsCard.tsx`

**Acceptance Criteria:**
- All stats display correctly
- Chart renders activity
- Updates in real-time

---

### Sprint 2 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 47
- **Priority breakdown:** 3 HIGH, 2 MEDIUM, 1 LOW
- **Duration:** 10 days (2 weeks)

---

## Sprint 3: AI Integration & Lesson Generation
**Duration:** Week 5-6 (10 days)  
**Status:** 📅 PLANNED

### Goals
- Build secure OpenAI proxy (Edge Functions)
- Implement AI lesson generation
- Create AI quiz generator
- Build AI tutor chat interface
- Add AI feedback for poem critique

### Task 3.1: Create OpenAI Edge Function Proxy
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Create Supabase Edge Function `ai-proxy`
- [ ] Store OpenAI API key securely (env vars)
- [ ] Implement rate limiting (10 req/min per user)
- [ ] Add request validation (JWT auth)
- [ ] Implement response validation (Zod schemas)
- [ ] Add error handling and logging
- [ ] Cache frequent responses (Redis optional)
- [ ] Test from client

**Files to Create:**
- `supabase/functions/ai-proxy/index.ts`
- `supabase/functions/ai-proxy/schemas.ts`
- `supabase/functions/_shared/openai.ts`

**Files to Modify:**
- `src/lib/openai.ts` (replace direct calls with Edge Function)

**Acceptance Criteria:**
- Client never sees OpenAI key
- Rate limiting enforced
- Responses validated

---

### Task 3.2: Build AI Lesson Generator
**Estimate:** 10 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design lesson generation prompt template
- [ ] Define strict JSON schema for lessons
- [ ] Create `generate-lesson` Edge Function
- [ ] Validate AI output with Zod
- [ ] Re-prompt on validation failure (max 3 tries)
- [ ] Store generated lessons in DB
- [ ] Add human review flag
- [ ] Build admin review UI

**Files to Create:**
- `supabase/functions/generate-lesson/index.ts`
- `supabase/functions/generate-lesson/prompts.ts`
- `supabase/functions/generate-lesson/schemas.ts`

**Files to Modify:**
- `src/screens/LearnScreen.tsx` (add "Generate Lesson" button)

**Acceptance Criteria:**
- Generated lessons valid JSON
- Steps render correctly
- Human review workflow works

---

### Task 3.3: Build AI Quiz Generator
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design quiz generation prompt
- [ ] Define quiz JSON schema (3-5 questions)
- [ ] Create `generate-quiz` Edge Function
- [ ] Validate questions and answers
- [ ] Ensure correct answer is accurate
- [ ] Store quizzes in DB
- [ ] Link quizzes to lessons
- [ ] Test quiz accuracy (manual review)

**Files to Create:**
- `supabase/functions/generate-quiz/index.ts`
- `supabase/functions/generate-quiz/prompts.ts`
- `supabase/functions/generate-quiz/schemas.ts`

**Acceptance Criteria:**
- Quizzes have 3-5 valid questions
- Answers are accurate
- Difficulty appropriate for lesson

---

### Task 3.4: Build AI Tutor Chat Interface
**Estimate:** 12 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Design AITutorScreen UI (chat interface)
- [ ] Implement message list with bubbles
- [ ] Add text input and send button
- [ ] Create `ai-tutor-chat` Edge Function
- [ ] Implement conversation context (last 10 messages)
- [ ] Add typing indicator
- [ ] Store conversation history
- [ ] Add suggested questions
- [ ] Implement "Ask about this lesson" feature

**Files to Modify:**
- `src/screens/AITutorScreen.tsx` (replace stub)

**Files to Create:**
- `supabase/functions/ai-tutor-chat/index.ts`
- `src/components/ChatBubble.tsx`
- `src/components/SuggestedQuestions.tsx`

**Acceptance Criteria:**
- Chat interface responsive
- AI responses relevant
- Context maintained across messages

---

### Task 3.5: Add AI Poem Feedback
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create `poem-feedback` Edge Function (already exists, enhance)
- [ ] Implement structured feedback (strengths, improvements, suggestions)
- [ ] Add feedback rendering in WriteScreen
- [ ] Add "Request Feedback" button
- [ ] Display feedback in modal
- [ ] Allow user to apply suggestions
- [ ] Store feedback history

**Files to Modify:**
- `supabase/functions/lesson-feedback/index.ts` (rename to poem-feedback)
- `src/screens/WriteScreen.tsx`

**Files to Create:**
- `src/components/AIFeedbackModal.tsx`

**Acceptance Criteria:**
- Feedback is constructive
- Suggestions actionable
- Modal UX smooth

---

### Task 3.6: Implement AI Content Moderation
**Estimate:** 6 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Create `content-moderation` Edge Function
- [ ] Use OpenAI Moderation API
- [ ] Check poems and posts for policy violations
- [ ] Flag inappropriate content
- [ ] Send to moderation queue
- [ ] Notify admins
- [ ] Test with edge cases

**Files to Create:**
- `supabase/functions/content-moderation/index.ts`

**Files to Modify:**
- `src/screens/WriteScreen.tsx` (check before publish)
- `src/screens/CommunityScree.tsx` (check posts)

**Acceptance Criteria:**
- Inappropriate content flagged
- False positive rate <5%
- No false negatives on obvious violations

---

### Sprint 3 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 52
- **Priority breakdown:** 3 HIGH, 2 MEDIUM, 1 LOW
- **Duration:** 10 days (2 weeks)

---

## Sprint 4: Learn Polish & Gamification
**Duration:** Week 7-8 (10 days)  
**Status:** 📅 PLANNED

### Goals
- Add gamification (badges, achievements, leaderboards)
- Polish Learn UX with animations
- Implement streaks and daily goals
- Add social learning features
- Optimize performance

### Task 4.1: Build Badge & Achievement System
**Estimate:** 10 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design achievements schema (id, name, description, icon, criteria)
- [ ] Create `achievements` and `user_achievements` tables
- [ ] Define 20+ achievements (lesson milestones, streaks, etc.)
- [ ] Implement achievement checking logic
- [ ] Award achievements on events
- [ ] Build AchievementToast component (celebration)
- [ ] Create Achievements screen
- [ ] Add badge display on profile

**Files to Create:**
- `supabase/migrations/004_achievements.sql`
- `src/screens/AchievementsScreen.tsx`
- `src/components/AchievementToast.tsx`
- `src/services/achievementService.ts`

**Acceptance Criteria:**
- Achievements unlock correctly
- Toast animations smooth
- All badges display on profile

---

### Task 4.2: Implement Streak System
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Track daily login and activity
- [ ] Calculate consecutive day streaks
- [ ] Store streak in `user_progress`
- [ ] Display streak in header with fire icon
- [ ] Award bonus XP for milestone streaks (7, 30, 100 days)
- [ ] Send streak reminder notifications (future)
- [ ] Handle streak breaks gracefully

**Files to Modify:**
- `src/context/ProgressContext.tsx`
- `src/screens/LearnScreen.tsx`

**Files to Create:**
- `src/components/StreakCounter.tsx`
- `src/utils/streakCalculator.ts`

**Acceptance Criteria:**
- Streak updates daily
- Bonus XP awarded at milestones
- Visual indicator clear

---

### Task 4.3: Build Leaderboards
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create global leaderboard (top 100 by XP)
- [ ] Create friends leaderboard
- [ ] Add weekly/monthly/all-time filters
- [ ] Implement efficient query (materialized view)
- [ ] Build LeaderboardScreen UI
- [ ] Show user's rank
- [ ] Add profile links
- [ ] Cache leaderboard data (1 hour)

**Files to Create:**
- `src/screens/LeaderboardScreen.tsx`
- `supabase/migrations/005_leaderboard_view.sql`
- `src/services/leaderboardService.ts`

**Acceptance Criteria:**
- Leaderboard loads <500ms
- User rank accurate
- Updates daily

---

### Task 4.4: Add Lesson Animations & Polish
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Add slide animations between lesson steps
- [ ] Implement progress ring animations
- [ ] Add confetti on lesson completion
- [ ] Smooth XP gain animation
- [ ] Add skeleton loaders
- [ ] Polish typography and spacing
- [ ] Add haptic feedback (mobile)
- [ ] Test on slow devices

**Files to Modify:**
- `src/screens/LessonsDetailScreen.tsx`
- `src/components/ProgressRing.tsx`

**Files to Create:**
- `src/components/Confetti.tsx`
- `src/utils/animations.ts`

**Acceptance Criteria:**
- Animations smooth (60fps)
- No jank on older devices
- Haptics feel natural

---

### Task 4.5: Implement Social Learning Features
**Estimate:** 8 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Add "Study Together" feature (show friends online)
- [ ] Create shared lesson progress
- [ ] Add lesson comments/discussion (basic)
- [ ] Show "X friends completed this" badge
- [ ] Add lesson recommendations based on friends
- [ ] Implement follow/unfollow

**Files to Create:**
- `src/screens/StudyTogetherScreen.tsx`
- `src/services/socialLearningService.ts`

**Acceptance Criteria:**
- Friends' progress visible
- Recommendations relevant
- Follow system works

---

### Task 4.6: Performance Optimization
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Profile app with React DevTools
- [ ] Optimize re-renders (React.memo, useMemo)
- [ ] Lazy load screens
- [ ] Reduce bundle size (tree shaking)
- [ ] Optimize images (compress, WebP)
- [ ] Add service worker for caching (web)
- [ ] Test on 3G network
- [ ] Achieve Lighthouse score >90

**Files to Modify:**
- Multiple files (memoization)
- `metro.config.js` (bundle optimization)

**Acceptance Criteria:**
- App loads <3s on 3G
- Smooth scrolling on low-end devices
- Bundle size <5MB

---

### Sprint 4 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 46
- **Priority breakdown:** 3 HIGH, 2 MEDIUM, 1 LOW
- **Duration:** 10 days (2 weeks)

---

## Sprint 5: Write Screen Enhancements
**Duration:** Week 9 (5 days)  
**Status:** 📅 PLANNED

### Goals
- Build rich text editor with advanced formatting
- Enhance AI writing tools
- Add templates and forms
- Implement auto-save and version history
- Polish UX

### Task 5.1: Build Rich Text Editor
**Estimate:** 12 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Replace basic TextInput with rich editor
- [ ] Add toolbar (bold, italic, underline, strikethrough, link)
- [ ] Implement heading levels (H1, H2, H3)
- [ ] Add ordered/unordered lists
- [ ] Support markdown shortcuts
- [ ] Add undo/redo with history stack
- [ ] Implement word count and character limit
- [ ] Add spell check highlighting

**Libraries to Evaluate:**
- `react-native-pell-rich-editor`
- `react-native-cn-quill`
- Custom solution with TextInput

**Files to Modify:**
- `src/screens/WriteScreen.tsx`

**Files to Create:**
- `src/components/RichTextEditor.tsx`
- `src/components/EditorToolbar.tsx`

**Acceptance Criteria:**
- All formatting options work
- Markdown shortcuts functional
- No performance issues with long text

---

### Task 5.2: Enhance AI Writing Tools
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Add more AI templates (expand, rhyme, imagery)
- [ ] Implement "Rewrite in style of..." feature
- [ ] Add grammar and style checking
- [ ] Implement AI autocomplete (suggestions as you type)
- [ ] Add "Explain this line" feature
- [ ] Improve prompt engineering for better results
- [ ] Add temperature and max tokens controls

**Files to Modify:**
- `src/screens/WriteScreen.tsx`
- `src/lib/openai.ts`

**Files to Create:**
- `supabase/functions/ai-writing-tools/index.ts`

**Acceptance Criteria:**
- All AI tools produce quality output
- Response time <3s
- User can customize parameters

---

### Task 5.3: Add Poetry Form Templates
**Estimate:** 6 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create template library (Sonnet, Haiku, Limerick, etc.)
- [ ] Build TemplateSelector modal
- [ ] Implement template scaffolding
- [ ] Add form-specific validation (syllable count, rhyme scheme)
- [ ] Show structure hints as user types
- [ ] Add example poems for each form

**Files to Create:**
- `src/data/poemTemplates.ts`
- `src/components/TemplateSelector.tsx`
- `src/utils/formValidators.ts`

**Acceptance Criteria:**
- 10+ templates available
- Validation works for common forms
- Hints are helpful not intrusive

---

### Task 5.4: Implement Auto-Save & Version History
**Estimate:** 6 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Auto-save draft every 30 seconds
- [ ] Store drafts in `poem_drafts` table
- [ ] Create version history on publish
- [ ] Build VersionHistoryModal
- [ ] Allow restoring previous versions
- [ ] Show diff between versions (optional)

**Files to Create:**
- `supabase/migrations/006_drafts_versions.sql`
- `src/components/VersionHistoryModal.tsx`
- `src/services/draftService.ts`

**Acceptance Criteria:**
- No data loss on app close
- Version history accurate
- Restore works correctly

---

### Task 5.5: Add Collaboration Features (Optional)
**Estimate:** 8 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Add "Share draft" feature
- [ ] Implement collaborative editing (realtime)
- [ ] Add inline comments
- [ ] Track multiple authors
- [ ] Add merge conflict resolution
- [ ] Build CollaboWriteScreen

**Files to Create:**
- `src/screens/CollaboWriteScreen.tsx`
- `src/services/collaborationService.ts`

**Acceptance Criteria:**
- Multiple users can edit simultaneously
- Changes sync in realtime
- No data corruption

---

### Task 5.6: Polish Write UX
**Estimate:** 4 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Add fullscreen mode
- [ ] Implement dark mode for writing
- [ ] Add focus mode (minimal UI)
- [ ] Improve keyboard shortcuts
- [ ] Add sound effects (optional, toggle)
- [ ] Polish animations
- [ ] Add reading time estimate

**Files to Modify:**
- `src/screens/WriteScreen.tsx`

**Acceptance Criteria:**
- Distraction-free writing
- All shortcuts work
- Dark mode comfortable

---

### Sprint 5 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 44
- **Priority breakdown:** 3 HIGH, 2 MEDIUM, 1 LOW
- **Duration:** 5 days (1 week)

---

## Sprint 6: Social Features & Messaging
**Duration:** Week 10 (5 days)  
**Status:** 📅 PLANNED

### Goals
- Complete follow/unfollow system
- Enhance messaging with media support
- Add notifications
- Build discovery features
- Implement playlists sharing

### Task 6.1: Complete Follow System
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Implement follow/unfollow API
- [ ] Update `followers` table with RLS
- [ ] Show followers/following counts
- [ ] Build FollowersScreen and FollowingScreen
- [ ] Add "Follow" button on profiles
- [ ] Implement feed filtering (show only followed authors)
- [ ] Add follow suggestions

**Files to Create:**
- `src/screens/FollowersScreen.tsx`
- `src/screens/FollowingScreen.tsx`
- `src/services/followService.ts` (enhance existing)

**Acceptance Criteria:**
- Follow/unfollow instant
- Counts accurate
- Feed filters work

---

### Task 6.2: Enhance Messaging with Media
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Add image upload to messages
- [ ] Support sharing poems via messages
- [ ] Add voice message recording (optional)
- [ ] Implement message reactions (emoji)
- [ ] Add message editing and deletion
- [ ] Implement message search
- [ ] Add conversation archiving

**Files to Modify:**
- `src/screens/MessagesScreen.tsx`
- `src/features/messaging/messagingService.ts`

**Files to Create:**
- `src/components/MessageReactions.tsx`
- `src/components/VoiceRecorder.tsx` (optional)

**Acceptance Criteria:**
- Images upload and display
- Poems share correctly
- Reactions work in realtime

---

### Task 6.3: Build Notifications System
**Estimate:** 10 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design notifications schema (type, user, content, read, created_at)
- [ ] Create `notifications` table
- [ ] Implement notification triggers (new follower, message, like, comment)
- [ ] Build NotificationsScreen
- [ ] Add notification badge in tab bar
- [ ] Implement push notifications (Expo)
- [ ] Add notification preferences
- [ ] Support real-time notifications

**Files to Create:**
- `supabase/migrations/007_notifications.sql`
- `src/screens/NotificationsScreen.tsx`
- `src/services/notificationService.ts`
- `src/utils/pushNotifications.ts`

**Acceptance Criteria:**
- Notifications appear in realtime
- Push notifications work (mobile)
- Badge count accurate

---

### Task 6.4: Build Discovery Features
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create DiscoverScreen (new tab or Read sub-tab)
- [ ] Add "Trending" poems (by recent likes)
- [ ] Add "Editors' Picks" (manually curated)
- [ ] Implement "Random Poem" feature
- [ ] Add "Similar Poems" recommendations (basic)
- [ ] Show "New Authors" section
- [ ] Add daily/weekly digest

**Files to Create:**
- `src/screens/DiscoverScreen.tsx`
- `src/services/discoveryService.ts`

**Acceptance Criteria:**
- Trending updates daily
- Recommendations relevant
- Random feature works

---

### Task 6.5: Implement Playlist Sharing
**Estimate:** 6 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Add "Make Public" toggle on playlists
- [ ] Generate shareable links
- [ ] Build PublicPlaylistScreen (view-only)
- [ ] Add "Copy Link" and "Share" buttons
- [ ] Implement playlist following
- [ ] Show playlist stats (followers, plays)

**Files to Modify:**
- `src/screens/PlaylistScreen.tsx`

**Files to Create:**
- `src/screens/PublicPlaylistScreen.tsx`

**Acceptance Criteria:**
- Playlists shareable via link
- Public playlists discoverable
- Follow system works

---

### Task 6.6: Add Activity Feed
**Estimate:** 6 hours  
**Priority:** LOW  
**Subtasks:**
- [ ] Create ActivityFeedScreen (Profile tab)
- [ ] Show user's recent actions (liked, published, followed)
- [ ] Show friends' activity (following feed)
- [ ] Add filters (own activity, friends, all)
- [ ] Make items clickable (navigate to poem/profile)
- [ ] Add infinite scroll

**Files to Create:**
- `src/screens/ActivityFeedScreen.tsx`
- `src/services/activityService.ts`

**Acceptance Criteria:**
- Activity displays correctly
- Feed updates in realtime
- Navigation works

---

### Sprint 6 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 44
- **Priority breakdown:** 2 HIGH, 2 MEDIUM, 2 LOW
- **Duration:** 5 days (1 week)

---

## Sprint 7: Production Readiness & Security
**Duration:** Week 11 (5 days)  
**Status:** 📅 PLANNED

### Goals
- Implement comprehensive security
- Add monitoring and analytics
- Optimize for production
- Write tests
- Prepare for Play Store

### Task 7.1: Implement Row Level Security (RLS)
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Audit all tables for RLS policies
- [ ] Implement policies for poems (authors can edit own)
- [ ] Implement policies for user_lessons (users can edit own)
- [ ] Implement policies for messages (sender/receiver only)
- [ ] Implement policies for followers
- [ ] Test policies with different user roles
- [ ] Document RLS rules

**Files to Create:**
- `supabase/migrations/008_rls_policies.sql`

**Acceptance Criteria:**
- Users can only access their own data
- No unauthorized reads/writes
- Policies tested and documented

---

### Task 7.2: Add Monitoring & Analytics
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Integrate Sentry for error tracking
- [ ] Add analytics (Mixpanel or PostHog)
- [ ] Track key events (signup, publish, lesson complete)
- [ ] Set up custom dashboards
- [ ] Add performance monitoring
- [ ] Create alerts for critical errors
- [ ] Add logging service (Logtail or CloudWatch)

**Files to Create:**
- `src/utils/analytics.ts`
- `src/utils/errorTracking.ts`

**Files to Modify:**
- `App.tsx` (initialize services)

**Acceptance Criteria:**
- Errors logged to Sentry
- Key events tracked
- Dashboards show data

---

### Task 7.3: Write Comprehensive Tests
**Estimate:** 12 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Set up Jest and React Testing Library
- [ ] Write unit tests for utils (XP calculator, validators)
- [ ] Write component tests (PoemCard, LessonStep)
- [ ] Write integration tests (auth flow, publish flow)
- [ ] Write E2E tests with Detox (signup, learn, publish)
- [ ] Achieve 80% code coverage
- [ ] Add tests to CI workflow

**Files to Create:**
- `__tests__/utils/xpCalculator.test.ts`
- `__tests__/components/PoemCard.test.tsx`
- `__tests__/integration/auth.test.tsx`
- `e2e/learn.e2e.ts`

**Acceptance Criteria:**
- All critical paths tested
- Coverage >80%
- CI runs tests on PRs

---

### Task 7.4: Optimize Bundle & Performance
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Analyze bundle with `react-native-bundle-visualizer`
- [ ] Remove unused dependencies
- [ ] Implement code splitting
- [ ] Lazy load heavy screens
- [ ] Optimize images (compress, use WebP)
- [ ] Add memoization where needed
- [ ] Test on slow devices (emulator throttling)
- [ ] Achieve <3s initial load

**Files to Modify:**
- `metro.config.js`
- Multiple files (memoization)

**Acceptance Criteria:**
- Bundle size <8MB (Android), <12MB (iOS)
- App loads <3s on 3G
- Smooth performance on older devices

---

### Task 7.5: Implement Rate Limiting & Abuse Prevention
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Add rate limiting to Edge Functions (10 req/min)
- [ ] Implement CAPTCHA for signup (Turnstile)
- [ ] Add spam detection for posts/poems
- [ ] Limit publish rate (5 poems/hour)
- [ ] Block abusive users (admin tool)
- [ ] Add reporting system

**Files to Create:**
- `supabase/functions/_shared/rateLimiter.ts`
- `src/screens/admin/ReportsScreen.tsx`

**Acceptance Criteria:**
- Rate limiting enforced
- Spam filtered
- Abuse reporting works

---

### Task 7.6: Prepare Play Store Assets
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Design app icon (1024x1024)
- [ ] Create feature graphic (1024x500)
- [ ] Design screenshots (phone, tablet, 7" tablet)
- [ ] Write app description (short, long)
- [ ] Prepare privacy policy
- [ ] Prepare terms of service
- [ ] Create promotional video (optional)
- [ ] Compile Play Store listing

**Files to Create:**
- `assets/playstore/icon.png`
- `assets/playstore/feature-graphic.png`
- `assets/playstore/screenshots/`
- `PRIVACY_POLICY.md`
- `TERMS_OF_SERVICE.md`

**Acceptance Criteria:**
- All assets meet Play Store requirements
- Legal docs complete
- Listing compelling

---

### Sprint 7 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 48
- **Priority breakdown:** 6 HIGH
- **Duration:** 5 days (1 week)

---

## Sprint 8: Play Store Launch
**Duration:** Week 12 (5 days)  
**Status:** 📅 PLANNED

### Goals
- Final QA and bug fixes
- Beta testing with users
- Submit to Play Store
- Launch marketing
- Monitor production

### Task 8.1: Final QA & Bug Fixing
**Estimate:** 10 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Run full regression test suite
- [ ] Test on multiple devices (5+ different)
- [ ] Test on different Android versions (10, 11, 12, 13, 14)
- [ ] Test all user flows end-to-end
- [ ] Fix critical bugs
- [ ] Fix UI inconsistencies
- [ ] Test offline behavior
- [ ] Verify no crashes

**Acceptance Criteria:**
- Zero critical bugs
- App stable on all tested devices
- All flows work

---

### Task 8.2: Beta Testing with Users
**Estimate:** 8 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Create closed beta track in Play Console
- [ ] Invite 20-50 beta testers
- [ ] Collect feedback via form
- [ ] Monitor Sentry for errors
- [ ] Fix reported issues
- [ ] Iterate based on feedback
- [ ] Get approval from testers

**Files to Create:**
- `BETA_TESTING_GUIDE.md`

**Acceptance Criteria:**
- Beta version stable
- Critical feedback addressed
- Positive user sentiment

---

### Task 8.3: Play Store Submission
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Build production APK/AAB with EAS
- [ ] Upload to Play Console
- [ ] Fill in all listing details
- [ ] Upload screenshots and assets
- [ ] Set pricing (free) and availability
- [ ] Complete content rating questionnaire
- [ ] Submit for review
- [ ] Respond to review feedback if needed

**Acceptance Criteria:**
- App submitted to Play Store
- All required info provided
- Passed initial review

---

### Task 8.4: Launch Marketing Campaign
**Estimate:** 8 hours  
**Priority:** MEDIUM  
**Subtasks:**
- [ ] Create landing page (simple)
- [ ] Write launch blog post
- [ ] Post on social media (Twitter, LinkedIn, Reddit)
- [ ] Email friends/family
- [ ] Submit to ProductHunt
- [ ] Post in relevant communities (poetry subreddits, Discord)
- [ ] Create demo video
- [ ] Prepare press kit

**Files to Create:**
- `landing-page/` (simple HTML/CSS or Next.js)

**Acceptance Criteria:**
- Landing page live
- Social posts published
- ProductHunt submission live

---

### Task 8.5: Set Up Production Monitoring
**Estimate:** 6 hours  
**Priority:** HIGH  
**Subtasks:**
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure Sentry alerts
- [ ] Set up analytics dashboards
- [ ] Create on-call schedule (yourself)
- [ ] Set up crash alerts (Slack/email)
- [ ] Monitor Play Console reviews
- [ ] Set up database backups (daily)

**Acceptance Criteria:**
- Monitoring active
- Alerts configured
- Backups automated

---

### Task 8.6: Post-Launch Support & Iteration
**Estimate:** Ongoing  
**Priority:** HIGH  
**Subtasks:**
- [ ] Respond to user reviews (24h SLA)
- [ ] Fix critical bugs (hot fixes)
- [ ] Monitor analytics for issues
- [ ] Collect feature requests
- [ ] Plan post-launch sprints
- [ ] Celebrate launch! 🎉

**Acceptance Criteria:**
- App live on Play Store
- Users downloading
- No critical issues

---

### Sprint 8 Metrics (Estimated)
- **Total tasks:** 6
- **Estimated hours:** 38
- **Priority breakdown:** 5 HIGH, 1 MEDIUM
- **Duration:** 5 days (1 week)

---

## 📊 Overall Project Metrics

| Metric | Value |
|--------|-------|
| **Total Sprints** | 8 |
| **Total Duration** | 12 weeks (3 months) |
| **Total Tasks** | 62 |
| **Total Estimated Hours** | ~440 hours |
| **Average Sprint Duration** | 6.5 days |
| **Average Tasks per Sprint** | 7.75 |

---

## 🎯 Success Criteria (End of Sprint 8)

### Technical
- ✅ App published on Play Store
- ✅ Zero critical bugs in production
- ✅ Test coverage >80%
- ✅ Lighthouse score >90 (web)
- ✅ Load time <3s on 3G

### Features
- ✅ 500+ poems in database
- ✅ 20+ curated lessons
- ✅ AI tutor functional
- ✅ Quiz system complete
- ✅ Messaging with realtime
- ✅ Follow/notification system
- ✅ Gamification (XP, badges, streaks)

### Business
- ✅ 100+ downloads in first week
- ✅ 4.0+ star rating on Play Store
- ✅ <5% crash rate
- ✅ >50% D1 retention
- ✅ Positive user feedback

### Interview Readiness
- ✅ Full working demo (5-7 minutes)
- ✅ Architecture explanation prepared
- ✅ Code walkthrough practiced
- ✅ Technical deep-dive ready
- ✅ Scale/performance discussion ready

---

## 🚀 Post-Launch Roadmap (Sprint 9+)

### Sprint 9-12 (Months 4-6): Growth & Features
- iOS app (App Store)
- Web app (full responsive)
- Advanced AI features (style transfer, poem generation)
- Premium subscription (ad-free, unlimited AI)
- Collaborative writing features
- Poetry contests and events
- Podcast integration (audio poems)
- Internationalization (Spanish, French)

### Sprint 13-16 (Months 7-12): Scale & Revenue
- 10,000+ poems database
- Partnerships with poetry organizations
- Premium creator tools
- Merchandise (print poetry books)
- Poetry workshops (paid)
- Corporate accounts (schools, libraries)
- API for third-party integrations
- White-label solution

---

## 📝 Notes & Assumptions

### Team Capacity
- **Solo developer:** 8 hours/day, 5 days/week
- **Flexibility:** Some tasks can run in parallel
- **Buffer:** 20% buffer for unexpected issues built into estimates

### Dependencies
- **Supabase:** Hosted backend (free tier → pro tier)
- **OpenAI:** API costs (~$50-100/month during development)
- **Expo:** EAS Build for app compilation
- **Play Store:** One-time $25 registration fee

### Risks & Mitigations
- **Risk:** OpenAI rate limits → **Mitigation:** Implement caching, batch requests
- **Risk:** Supabase free tier limits → **Mitigation:** Upgrade to pro tier before launch
- **Risk:** Play Store rejection → **Mitigation:** Follow guidelines strictly, have backup plan
- **Risk:** Scope creep → **Mitigation:** Strict prioritization, MVP-first approach

### Definition of Done (All Sprints)
- [ ] Code reviewed (self-review + checklist)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] No regressions
- [ ] Deployed to staging
- [ ] Sprint demo recorded

---

**Document Version:** 1.0  
**Last Updated:** Sprint 0 completion  
**Next Review:** Start of Sprint 1  
**Owner:** @satyy2301

---

Ready to build something amazing! 🚀✨
