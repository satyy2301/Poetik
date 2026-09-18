# Poetik Beta Testing Guide

## Closed Beta Setup

1. Build preview AAB: `npm run build:android:preview`
2. Upload to Google Play Console → **Testing → Closed testing**
3. Create a tester list (email addresses)
4. Share opt-in link with testers

**Play Console opt-in link:** _(add after creating closed track)_

## Tester Invite Email

```
Subject: You're invited to beta test Poetik

Hi,

You're invited to try Poetik — a poetry learning and writing app.

Join the closed beta: [PLAY_CONSOLE_OPT_IN_LINK]

What to test:
- Sign up and complete one lesson
- Write and publish a poem
- Follow another user and send a message

Report bugs: https://github.com/satyy2301/Poetik/issues

Thanks!
Satyam
```

## Feedback Collection

- **GitHub Issues:** https://github.com/satyy2301/Poetik/issues (label: `beta-feedback`)
- **Google Form:** _(optional — create and link here)_

## What Testers Should Cover

Use [QA_CHECKLIST.md](QA_CHECKLIST.md) as the test script. Priority areas:

1. Signup and first lesson
2. Write and publish flow
3. Read feed and search
4. Messaging and notifications
5. Report content (flag icon / poem menu)

## Bug Reporting

Include:

- Device model and Android version
- Steps to reproduce
- Expected vs actual behavior
- Screenshot or screen recording if possible

Production errors are captured when `SENTRY_DSN` is configured in `app.json`.

## Exit Criteria (Promote to Production)

- [ ] 20+ testers opted in
- [ ] Zero critical crashes in 48 hours
- [ ] All P0/P1 beta issues resolved
- [ ] Average tester sentiment positive
- [ ] QA checklist passes on 3+ devices
