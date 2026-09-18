# Play Store Submission Checklist

Package name: **`com.poetik.app`**

## Pre-Submission

- [ ] Run [QA_CHECKLIST.md](../QA_CHECKLIST.md) on 3+ devices
- [ ] `npm run lint` and `npm test -- --ci` pass
- [ ] Production AAB built: `npm run build:android:production`
- [ ] Upload keystore configured via `eas credentials`
- [ ] Replace placeholder screenshots in `assets/playstore/screenshots/phone/`
- [ ] Replace `assets/playstore/feature-graphic.png` with final 1024×500 graphic

## Play Console Steps

1. **Create app** → default language English
2. **App content**
   - Privacy policy: `https://satyy2301.github.io/Poetik/privacy.html`
   - Terms: `https://satyy2301.github.io/Poetik/terms.html`
3. **Store listing**
   - Short description: see [PLAY_STORE_LISTING.md](../PLAY_STORE_LISTING.md)
   - Full description: see [PLAY_STORE_LISTING.md](../PLAY_STORE_LISTING.md)
   - App icon: `assets/icon.png`
   - Feature graphic: `assets/playstore/feature-graphic.png`
   - Screenshots: `assets/playstore/screenshots/phone/` (min 2)
4. **Release → Production**
   - Upload AAB from EAS build
   - Release name: `1.0.0`
   - Release notes: "Initial public release"

## Content Rating

Answer honestly:

- Violence: None
- Sexual content: None
- User-generated content: **Yes** (poems, messages, community posts)
- Moderation: In-app reporting + admin review

## Data Safety

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account |
| User content | Yes | No | App functionality |
| Crash logs | Optional | Sentry | Stability |
| Analytics | Optional | PostHog | Product improvement |

## Signing

**Do not ship debug keystore builds.**

```bash
eas credentials
eas build --platform android --profile production
```

Generate upload keystore (one-time, store securely):

```bash
keytool -genkey -v -keystore poetik-upload.keystore -alias poetik -keyalg RSA -keysize 2048 -validity 10000
```

## Post-Review

If rejected:

1. Read rejection reason in Play Console
2. Fix issue in code or listing
3. Increment `versionCode` in `android/app/build.gradle` or use EAS `autoIncrement`
4. Rebuild and resubmit within 7 days

## Response Template

```
Thank you for your feedback. We've addressed [issue] in version [X.Y.Z].
Please let us know if you have any other concerns.
```
