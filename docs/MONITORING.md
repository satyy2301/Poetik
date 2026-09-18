# Poetik Production Monitoring

## Sentry (Error Tracking)

1. Create project at [sentry.io](https://sentry.io) → React Native
2. Copy DSN into `app.json`:

```json
"extra": {
  "sentryDsn": "https://YOUR_KEY@oXXXX.ingest.sentry.io/XXXX"
}
```

3. Errors are captured via:
   - `ErrorBoundary` in `App.tsx`
   - `captureException` in auth and publish flows
   - `src/utils/errorTracking.ts`

### Recommended Alerts

- New issue count > 5 in 1 hour
- Crash-free sessions < 99%
- Email + Slack notification

## PostHog (Analytics)

1. Create project at [posthog.com](https://posthog.com)
2. Add project API key to `app.json`:

```json
"extra": {
  "posthogKey": "phc_YOUR_KEY"
}
```

### Key Events

| Event | When |
|-------|------|
| `signup` | User registers |
| `login` | User signs in |
| `publish_poem` | Poem published |
| `lesson_complete` | Lesson finished |
| `quiz_complete` | Quiz submitted |
| `screen_view` | Navigation change |

### Dashboards to Create

- Signups and logins per day
- Lessons completed per day
- Poems published per day
- Top screens by `screen_view`

## Uptime Monitoring

Ping Supabase health endpoint with [UptimeRobot](https://uptimerobot.com):

- URL: `https://YOUR_PROJECT.supabase.co/rest/v1/`
- Interval: 5 minutes
- Alert: email on 2 consecutive failures

## Play Console

- Check **Android vitals** daily during first week
- Respond to reviews within 24 hours
- Monitor crash rate target: < 1%

## Database Backups

Supabase Pro includes daily backups. Verify in:

**Dashboard → Project Settings → Database → Backups**

For manual backup before major release:

```bash
pg_dump "$DATABASE_URL" > poetik-backup-$(date +%Y%m%d).sql
```

## On-Call (Solo)

| Severity | Response |
|----------|----------|
| P0 — app down / data loss | Fix within 4 hours |
| P1 — core flow broken | Fix within 24 hours |
| P2 — UI bug | Next release |
