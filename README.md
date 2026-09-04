# ROME Seed Co. Website

Static marketing site for ROME Seed Co., served from Cloudflare Workers static assets and deployed from this repo on every push to `main`.

**Live:** https://romeseed.co
**Staging:** https://romeseed-co.chef-mthompson.workers.dev
**Worker:** `romeseed-co`

---

## Stack

| Layer | What | Notes |
|---|---|---|
| Hosting | Cloudflare Workers (static assets) | No build step, no server code |
| Source | GitHub — `chefmthompson/romeseed.co` | Push to `main` = deploy |
| Deploy | Workers Builds → `npx wrangler deploy` | ~60 seconds |
| DNS | Cloudflare | MX/SPF/DKIM/DMARC for Google Workspace |
| Fonts | Google Fonts (Cormorant Garamond, Inter) | Only third-party request |

There is no cart, checkout, or CMS. This is a single-page marketing site with a waitlist anchor. That is deliberate — ROME does not take online orders yet.

---

## Structure

```
public/
├── index.html                  # the homepage (~26KB)
├── 404.html                    # branded not-found page
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── _headers                    # security headers + cache policy
├── _redirects                  # legacy Squarespace paths -> anchors
└── assets/img/
    ├── hero.jpg                # hero background
    ├── waitlist.jpg            # waitlist band background
    ├── advantage.jpg           # hemp advantage photo
    ├── founder.jpg             # founder split photo
    ├── heritage-durum.jpg      # heritage band, left
    ├── heritage-craft.jpg      # heritage band, right
    ├── logo-horizontal-hemp.png    # nav lockup (light grounds)
    ├── logo-horizontal-cream.png   # footer lockup (dark grounds)
    ├── logo-vertical-hemp.png      # brand asset
    ├── logo-vertical-cream.png     # brand asset
    ├── og-image.jpg            # 1200x630 social card
    ├── favicon-32.png
    ├── apple-touch-icon.png
    └── icon-512.png

tools/check.js                  # pre-flight validation
wrangler.jsonc                  # Worker name + assets dir
```

---

## Working on it

```bash
npm install        # once
npm run check      # validate before every push
npm run dev        # preview at localhost:8787
```

`npm run check` must pass before you push. It verifies required files exist, the Worker name matches Cloudflare, every local reference resolves (including `url()` inside inline CSS), images are not re-embedded as base64, the CSP permits the fonts the page loads, and there are no stale Squarespace or Rooted Impact references.

### Deploying

```bash
git add .
git commit -m "Update <what changed>"
git push origin main
```

Cloudflare rebuilds automatically. Check **Workers & Pages → romeseed-co → Deployments**, then hard-reload (Cmd+Shift+R).

For small copy edits you can skip the terminal: edit the file on github.com, commit to `main`, done.

---

## Brand tokens

Defined in the `:root` block at the top of `index.html`:

| Token | Hex | Use |
|---|---|---|
| `--hemp` | `#2C4C34` | Primary green |
| `--earth` | `#B9A58A` | Regenerative earth |
| `--cream` | `#F6EFE3` | Pasta cream ground |
| `--steel` | `#5E676C` | Body text, secondary |
| `--black` | `#111111` | Seed black |
| `--gold` | `#C8A45E` | Omega gold, CTAs |
| `--rust` | `#9C5234` | Terra rust accent |
| `--herb` | `#76A378` | Fresh herb green |

Type: Cormorant Garamond (headlines), Inter (body).

---

## Caching

| Path | Policy | Why |
|---|---|---|
| `/assets/img/*` | `immutable`, 1 year | Rename the file to bust it |
| `/assets/fonts/*` | `immutable`, 1 year | Same |
| `/favicon.ico` | 7 days | Rarely changes |
| `/assets/css/*`, `/assets/js/*` | `no-cache` | Revalidates each request |
| HTML | `no-cache` | Always revalidates; unchanged pages return 304 |

Images are stored as real files rather than base64 in the HTML. That keeps `index.html` at ~26KB instead of 1.5MB and lets the images cache for a year.

---

## Known gaps

- **SKU macros are placeholders.** All four products show `[XX]g Protein · [X]g Fiber`. Replace with the real nutrition panel values before launch — `npm run check` warns until you do.
- **The waitlist button has no form behind it.** It scrolls to the `#waitlist` anchor. Wiring HubSpot is a follow-up; the CSP in `_headers` already permits it.
- **Nav links are anchors, not pages.** Our Story, Shop, Recipes, Foodservice all scroll within the homepage. `_redirects` maps the old Squarespace paths to those anchors so inbound links don't 404.

---

## Contacts

Matthew Thompson — matthew@romeseed.co
Roberto Cristiano — roberto@romeseed.co
