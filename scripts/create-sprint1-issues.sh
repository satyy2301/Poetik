#!/bin/bash

# Script to create GitHub labels and Sprint 1 issues
# Run with: bash scripts/create-sprint1-issues.sh

echo "Creating GitHub labels..."

# Create labels
gh label create "sprint-1" --description "Sprint 1 tasks" --color "0E8A16" 2>/dev/null || echo "Label sprint-1 already exists"
gh label create "high-priority" --description "High priority task" --color "D93F0B" 2>/dev/null || echo "Label high-priority already exists"
gh label create "medium-priority" --description "Medium priority task" --color "FBCA04" 2>/dev/null || echo "Label medium-priority already exists"
gh label create "low-priority" --description "Low priority task" --color "0075CA" 2>/dev/null || echo "Label low-priority already exists"
gh label create "database" --description "Database related" --color "1D76DB" 2>/dev/null || echo "Label database already exists"
gh label create "backend" --description "Backend development" --color "5319E7" 2>/dev/null || echo "Label backend already exists"
gh label create "frontend" --description "Frontend development" --color "FBCA04" 2>/dev/null || echo "Label frontend already exists"

echo "Labels created successfully!"
echo ""
echo "Creating Sprint 1 issues (without milestone for now)..."
echo ""

# Task 1.1
gh issue create --title "Sprint 1 - Task 1.1: Design Poems/Authors Schema" --body "**Priority:** HIGH  
**Estimate:** 4 hours

### Description
Design comprehensive database schema for poems and authors tables with support for both canonical (public domain) and user-generated content.

### Subtasks
- [ ] Design \`poems\` table (id, title, body, author_id, themes, form, visibility, created_at)
- [ ] Design \`authors\` table (id, name, bio, birth_year, death_year, canonical, created_at)
- [ ] Design \`poem_versions\` table for user edits/moderation
- [ ] Add full-text search column (tsvector)
- [ ] Add indexes for performance (GIN, B-tree)
- [ ] Design RLS policies (public read, authenticated write)
- [ ] Create migration file

### Files to Create
- \`supabase/migrations/001_poems_authors.sql\`

### Acceptance Criteria
- Schema supports both canonical and user-generated poems
- Full-text search ready
- RLS policies defined

### Sprint
Sprint 1 - Week 2" --label "sprint-1,high-priority,database"

echo "✓ Created Task 1.1"

# Task 1.2
gh issue create --title "Sprint 1 - Task 1.2: Implement Poems Ingestion Pipeline" --body "**Priority:** HIGH  
**Estimate:** 8 hours

### Description
Build automated pipeline to ingest public domain poems from various sources (Project Gutenberg, Poetry Foundation) and populate the database.

### Subtasks
- [ ] Research public domain sources (Project Gutenberg, Poetry Foundation)
- [ ] Create ingestion script (\`scripts/ingestPoems.ts\`)
- [ ] Parse and normalize poem data
- [ ] Handle author creation/lookup
- [ ] Batch insert poems (100 at a time)
- [ ] Add error handling and logging
- [ ] Ingest 500+ poems for demo

### Files to Create
- \`scripts/ingestPoems.ts\`
- \`scripts/sources/gutenberg.ts\`
- \`scripts/sources/poetrydb.ts\`

### Acceptance Criteria
- 500+ poems in database
- Authors properly linked
- No duplicate poems

### Dependencies
Blocked by Task 1.1 (Schema must exist first)

### Sprint
Sprint 1 - Week 2" --label "sprint-1,high-priority,backend"

echo "✓ Created Task 1.2"

# Task 1.3
gh issue create --title "Sprint 1 - Task 1.3: Build Author Profile Screen" --body "**Priority:** HIGH  
**Estimate:** 6 hours

### Description
Create comprehensive author profile screen showing bio, statistics, and list of author's poems with pagination.

### Subtasks
- [ ] Create \`AuthorProfileScreen.tsx\`
- [ ] Fetch author data with poem count
- [ ] Display bio, dates, stats
- [ ] Show list of author's poems (paginated)
- [ ] Add \"Follow Author\" button (future feature)
- [ ] Add loading and error states
- [ ] Style with consistent theme

### Files to Create
- \`src/screens/AuthorProfileScreen.tsx\`
- \`src/services/authorService.ts\`

### Files to Modify
- \`src/navigation/AppNavigator.tsx\` (register screen)
- \`src/components/PoemCard.tsx\` (make author name clickable)

### Acceptance Criteria
- Clicking author name opens profile
- Profile shows bio and poems
- Pagination works correctly

### Dependencies
Blocked by Task 1.2 (Need poems/authors data)

### Sprint
Sprint 1 - Week 2" --label "sprint-1,high-priority,frontend"

echo "✓ Created Task 1.3"

# Task 1.4
gh issue create --title "Sprint 1 - Task 1.4: Implement Full-Text Search" --body "**Priority:** MEDIUM  
**Estimate:** 5 hours

### Description
Add full-text search capability to poems table with filters and performance optimization.

### Subtasks
- [ ] Add tsvector column to poems table
- [ ] Create trigger to auto-update search column
- [ ] Implement \`searchPoems\` function in service
- [ ] Add debounced search in \`SearchScreen\`
- [ ] Support filters (author, form, themes)
- [ ] Add search highlighting (optional)
- [ ] Test search performance (<300ms)

### Files to Modify
- \`supabase/migrations/002_full_text_search.sql\`
- \`src/screens/SearchScreen.tsx\`
- \`src/services/poemService.ts\`

### Acceptance Criteria
- Search returns results <300ms
- Filters work correctly
- Handles typos gracefully

### Sprint
Sprint 1 - Week 2" --label "sprint-1,medium-priority,backend"

echo "✓ Created Task 1.4"

# Task 1.5
gh issue create --title "Sprint 1 - Task 1.5: Enhance Read Screen Feed" --body "**Priority:** MEDIUM  
**Estimate:** 6 hours

### Description
Optimize Read screen with cursor-based pagination, infinite scroll, and performance improvements.

### Subtasks
- [ ] Implement cursor-based pagination
- [ ] Add infinite scroll (FlatList)
- [ ] Optimize PoemCard rendering (React.memo)
- [ ] Add filters (by form, theme, author)
- [ ] Add sort options (newest, popular, random)
- [ ] Implement pull-to-refresh
- [ ] Test with 1000+ poems

### Files to Modify
- \`src/screens/ReadScreen.tsx\`
- \`src/components/PoemCard.tsx\`
- \`src/services/poemService.ts\`

### Acceptance Criteria
- Smooth scrolling with 1000+ poems
- Pagination works correctly
- Filters apply instantly

### Sprint
Sprint 1 - Week 2" --label "sprint-1,medium-priority,frontend"

echo "✓ Created Task 1.5"

# Task 1.6
gh issue create --title "Sprint 1 - Task 1.6: Add Poem Moderation Queue" --body "**Priority:** LOW  
**Estimate:** 4 hours

### Description
Create basic moderation queue for user-submitted poems with approval workflow.

### Subtasks
- [ ] Create \`poem_versions\` table workflow
- [ ] Implement submit-for-review flow
- [ ] Create admin moderation UI (basic)
- [ ] Add approval/rejection logic
- [ ] Send notifications (future)

### Files to Create
- \`src/screens/admin/ModerationQueueScreen.tsx\`
- \`src/services/moderationService.ts\`

### Acceptance Criteria
- User poems go to pending status
- Admin can approve/reject
- Approved poems visible to all

### Sprint
Sprint 1 - Week 2" --label "sprint-1,low-priority,backend"

echo "✓ Created Task 1.6"

echo ""
echo "========================================="
echo "✅ All Sprint 1 issues created!"
echo "========================================="
echo ""
echo "Summary:"
echo "- 6 issues created"
echo "- Labels: sprint-1, high-priority, medium-priority, low-priority"
echo "- Note: Milestones are not supported by gh CLI, use GitHub web UI to organize"
echo ""
echo "View issues: gh issue list --label 'sprint-1'"
echo "========================================="
