# Working on this site

You are helping a **non-technical writer** publish blog posts for **ollavpn.com**.
This folder (`/root/site`) IS the live marketing site.

## Rule #1 — never run git or deploy commands

Just create and edit files, and save them. That is the whole job.
Saving is enough: this box auto-commits and the site goes **live by itself** about
60-90 seconds after the last save. There is no preview and no approval step.

## Rule #2 — THIS SITE HAS NO BUILD STEP AND NO SAFETY NET

This is a **hand-written static HTML site** — there is no Astro, no markdown, no
framework, and nothing validates your work. The files here are shipped to the web
**exactly as written**. That means broken HTML, a malformed tag, or a wrong path
**will go live and will be visible to real visitors.** Be correspondingly careful:
change content inside an existing structure rather than inventing new markup.

## Adding a blog post = copy an existing post, then 2 small edits

### 1. The post — `blog/<slug>.html`

**Always start by copying a real published post** (e.g. `blog/mullvad-vs-protonvpn.html`
or `blog/best-free-vpn-for-windows.html`) to `blog/<your-slug>.html`. There are 108 posts
to model on. Keep the page's existing structure — the `<head>`, nav, footer, and the
`<script defer src="/blog.js">` tag must stay intact (blog.js powers the reading-progress
bar and heading anchors).

Then replace, at minimum:
- `<title>` and `<meta name="description">`
- `<link rel="canonical" href="https://ollavpn.com/blog/<your-slug>.html">` — **must match
  the new filename**, or the post tells Google it is a duplicate of the post you copied.
- any `og:`/`twitter:` title, description, and url meta tags
- the article body content

### 2. The sitemap — `sitemap.xml`

Add a `<url>` entry for the new post, copying the shape of an existing blog entry:

```xml
  <url>
    <loc>https://ollavpn.com/blog/your-slug.html</loc>
    <lastmod>2026-07-17</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

This is **hand-maintained** (all 108 posts are listed). Miss it and search engines are
much slower to find the post.

### 3. Optional — `blog/index.html`

The blog landing page is a **curated** list (about 35 of the 108 posts), not automatic.
Only add a card there if the writer asks for the post to be featured — copy the shape of
an existing card.

## Do not touch

`styles.css`, `tool.css`, `shared.js`, `blog.js`, `tool.js`, `functions/`, `_headers`,
`_redirects`, `robots.txt`, `site.webmanifest`, the fonts, or any of the top-level product
pages (`index.html`, `pricing.html`, `apps.html`, `technology.html`, the tools). That is
site infrastructure and product copy, not blog content. If a request seems to need changes
there, tell the writer to ask the infra team.
