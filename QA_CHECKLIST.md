# Poetik QA Checklist — Sprint 8

Run before every release candidate build.

## Auth

- [ ] Sign up with new email creates user + author rows
- [ ] Login persists session across app restart
- [ ] Logout returns to login screen and clears local state
- [ ] Invalid credentials show clear error

## Read

- [ ] Feed loads with pagination (scroll to load more)
- [ ] Sort filters work (newest, popular, random)
- [ ] Search returns poems, authors, users
- [ ] Poem detail opens from card tap
- [ ] Author profile opens from name tap

## Write

- [ ] Draft auto-saves within 30 seconds
- [ ] Template selector applies form scaffolding
- [ ] Publish creates poem with `pending` visibility
- [ ] Rate limit blocks after 5 publishes/hour
- [ ] Blocked user cannot publish
- [ ] Spam content is rejected

## Learn

- [ ] Lesson steps advance (theory → example → exercise → quiz)
- [ ] Lesson completion awards XP and updates streak
- [ ] Quiz submission scores correctly
- [ ] Daily challenge loads and submits

## Social

- [ ] Follow / unfollow updates counts
- [ ] Messages send and receive
- [ ] Notifications badge updates
- [ ] Community post creation works
- [ ] Community spam is blocked

## Admin / Safety

- [ ] Moderation queue shows pending poems
- [ ] Approve / reject updates visibility
- [ ] User can report poem from card menu
- [ ] User can report profile from author screen
- [ ] Admin can dismiss or action reports
- [ ] Admin can block reported user

## Release

- [ ] `npm run lint` passes
- [ ] `npm test -- --ci` passes
- [ ] App loads on Android emulator (API 33+)
- [ ] No crash on cold start
