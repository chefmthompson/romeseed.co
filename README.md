# ROME Seed Co. Website

Static marketing website for ROME Seed Co., built on Cloudflare Workers and deployed via GitHub.

**Live at:** https://romeseed.co

---

## Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Hosting** | Cloudflare Workers | Free static assets, fast global CDN, < 1 min deploys |
| **Source** | GitHub (this repo) | Version history, branch-based workflow |
| **Deploy** | Cloudflare Pages + GitHub integration | Auto-deploy on push to `main` |
| **Domain DNS** | Cloudflare | Security headers, email auth (MX/SPF/DKIM/DMARC) |
| **Forms** | HubSpot embedded forms | CRM integration for contact/appointments |

---

## Directory Structure

```
public/
├── index.html                 # Homepage
├── about.html                 # About page
├── our-story.html             # Story page
├── the-hemp-advantage.html    # Product positioning
├── foodservice.html           # B2B page
├── recipes.html               # Content/recipes
├── contact.html               # Contact page
├── appointments.html          # Booking page
├── shop/                      # Product pages (if e-commerce enabled)
├── 404.html                   # Not found page
├── robots.txt                 # SEO
├── sitemap.xml                # SEO sitemap
├── _headers                   # Security headers & cache rules
├── _redirects                 # URL redirects
└── assets/
    ├── css/
    │   └── site.css          # Main stylesheet (no-cache)
    ├── js/
    │   └── nav.js            # Navigation script (no-cache)
    ├── fonts/                # Self-hosted woff2 fonts
    └── img/                  # All images (self-hosted, immutable)

tools/
└── check.js                   # Pre-flight verification script
```

---

## Setup

### 1. Prerequisites

- Node.js 18+ and npm
- GitHub account with repo access
- Cloudflare account (free tier)

### 2. Install dependencies

```bash
npm install
```

This installs Wrangler v4, the Cloudflare deployment CLI.

### 3. Run pre-flight checks

Before every push:

```bash
npm run check
```

This verifies:
- ✓ All required files exist
- ✓ Worker name matches Cloudflare
- ✓ No broken internal links
- ✓ Sitemap includes all pages
- ✓ No stale domain references

### 4. Local development

To preview the site locally:

```bash
npm run dev
```

Opens http://localhost:8787 (Wrangler's dev server)

---

## Deployment Workflow

### Push to main = auto-deploy (via Cloudflare Pages)

1. Make changes to `public/` folder
2. Commit and push to `main`:
   ```bash
   git add public/
   git commit -m "Update [page/section]"
   git push origin main
   ```
3. Cloudflare Pages detects the push
4. Site deploys in ~60 seconds
5. Live at https://romeseed.co

### For non-technical updates

Use GitHub's web editor (no terminal needed):
- Go to github.com → navigate to a file → pencil icon → edit → commit to `main`

### After CSS or font changes

Hard-reload in browser: **Cmd+Shift+R** (macOS) or **Ctrl+Shift+R** (Windows/Linux)

---

## Security & Performance

### Cache Strategy

| File Type | Cache Rule | Why |
|-----------|-----------|-----|
| Fonts (woff2) | immutable, 1 year | Never change, aggressive cache |
| Images (jpg, png) | immutable, 1 year | Stable content |
| CSS, JS | no-cache | Check with server; fetch if changed |
| HTML | no-cache | Always check for updates |

See `public/_headers` for details.

### Content Security Policy

All external resources are whitelisted in `_headers`:
- HubSpot forms allowed (js.hsforms.net)
- No inline scripts (except `unsafe-inline` CSS for performance)
- No external images (all self-hosted)

### Email Security

MX records, SPF, DKIM, and DMARC are configured in Cloudflare DNS.
All email (matthew@, roberto@) flows through Google Workspace.

---

## Editing Content

### Pages

Edit any `.html` file in `public/`:

```bash
# Example: Edit about page
public/about.html
```

### Styles

Main stylesheet:
```bash
public/assets/css/site.css
```

No build step — CSS changes are live after commit.

### Images

1. Optimize image (JPEG quality, reduce file size)
2. Save to `public/assets/img/`
3. Reference in HTML:
   ```html
   <img src="/assets/img/example.jpg" alt="Description">
   ```
4. Commit and push

### Navigation

JavaScript for mobile nav:
```bash
public/assets/js/nav.js
```

---

## Troubleshooting

### Site not updating after push?

1. Check Cloudflare Pages → Deployments tab (any build errors?)
2. Confirm you pushed to `main` (not a side branch)
3. Hard-reload browser: Cmd+Shift+R
4. Wait 60 seconds for deploy to finish

### Old images still showing?

- Images have a 1-year cache
- Hard-reload: Cmd+Shift+R
- Or rename the image file and update the reference

### CSS not applying?

- CSS has no-cache, so should update quickly
- Hard-reload: Cmd+Shift+R
- Verify `public/assets/css/site.css` exists

### Link returns 404?

Run `npm run check` to find broken links:
```bash
npm run check
```

Check the output — it will tell you which links are broken.

### Form submissions not working?

- Verify HubSpot form embed code is in the HTML
- Check Cloudflare's `_headers` file for HubSpot CSP rules
- Test in incognito/private mode (no browser extensions)

---

## Domain & DNS

**Domain Registrar:** Google Domains (legacy Squarespace-managed)  
**DNS Provider:** Cloudflare

**Nameservers:**
- ns-123.cloudflare.com (example; check Cloudflare dashboard for actual values)
- ns-456.cloudflare.com

**MX Records:** Google Workspace (5 records)  
**SPF:** `v=spf1 include:_spf.google.com ~all`  
**DMARC:** `v=DMARC1; p=quarantine; rua=mailto:matthew@romeseed.co`

---

## Performance Metrics

Target metrics (Phase 5 verification):
- **Every page:** 200 HTTP response
- **Third-party requests:** Exactly 1 (HubSpot form script)
- **Lighthouse:** 90+ on Performance, Accessibility, Best Practices, SEO

Test with:
```bash
npm run check
```

And use Chrome DevTools → Network tab to verify third-party requests.

---

## Contacts

**Site Owner:** Matthew Thompson (matthew@romeseed.co)  
**Co-founder:** Roberto Cristiano (roberto@romeseed.co)  
**Hosting/Infrastructure:** Cloudflare  
**Design/Development:** Claude

---

## Version History

- **v1.0.0** (Sep 2026) – Initial Cloudflare migration from Squarespace
