# OllaVPN — marketing site

Static HTML / CSS / JS for `ollavpn.com`. Hosted on Cloudflare Pages
with zero build step.

## Local preview

```bash
cd apps/marketing
python -m http.server 8080
# visit http://localhost:8080
```

## Pages

| File | Purpose |
|---|---|
| `index.html` | Product home |
| `pricing.html` | Lifetime free + $2/mo plan |
| `apps.html` | Platform overview |
| `technology.html` | How OllaVPN works |
| `dl/index.html` | Windows download |
| `blog/` | Long-form content |
| `404.html` | Not-found page |
| `styles.css` | Shared design tokens |
| `shared.js` | Reveal animations, FAQ toggle, pricing toggle |

## Brand assets

| File | Use |
|---|---|
| `favicon.svg` / `favicon.ico` / `favicon-*.png` | Multi-tier favicon stack |
| `apple-touch-icon.png` | iOS home-screen icon |
| `android-chrome-*.png` | Android launcher icons |
| `og-image.png` | 1200×630 Open Graph share image |
| `site.webmanifest` | PWA manifest |

## Policy files

`robots.txt`, `sitemap.xml`, `humans.txt`, `llms.txt`, `.well-known/security.txt`.

## Tone

CMO voice: clear, confident, human. No internal infrastructure detail
in user-facing copy. No comparison spec-sheets, no roadmap gaps
volunteered, no fear-marketing.
