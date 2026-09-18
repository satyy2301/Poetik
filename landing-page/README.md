# Poetik Landing Page

Static marketing site for GitHub Pages or any static host.

## Deploy to GitHub Pages

1. Push repo to GitHub
2. Settings → Pages → Source: **Deploy from branch**
3. Branch: `main`, folder: `/landing-page`
4. Site URL: `https://satyy2301.github.io/Poetik/`

Update `PLAY_STORE_LISTING.md` and Play Console with:

- Privacy: `https://satyy2301.github.io/Poetik/privacy.html`
- Terms: `https://satyy2301.github.io/Poetik/terms.html`

## Local Preview

Open `index.html` in a browser, or:

```bash
npx serve landing-page
```

## After Play Store Approval

Update the download CTA in `index.html`:

```html
<a class="cta" href="https://play.google.com/store/apps/details?id=com.poetik.app">Get it on Google Play</a>
```
