# GitHub Setup Guide for ROME Seed Co. Website

**What you're getting:** A fully configured Cloudflare static site, ready to push to GitHub.

**What's been done:** All configuration files have been customized for ROME Seed Co. You just need to create a GitHub repo and push.

---

## Before You Start

- [ ] GitHub account (github.com)
- [ ] You can push to a new repo

---

## Step 1: Create GitHub Repository

1. Go to **github.com** → **New repository**
2. Fill in:
   - **Repository name:** `romeseed.co` (or `rome-website`)
   - **Description:** "ROME Seed Co. website — static site on Cloudflare"
   - **Visibility:** Public
   - **Initialize with:** Skip (don't initialize with README — we have one)
3. Click **Create repository**

You'll see a page with instructions. Copy the HTTPS URL (looks like `https://github.com/username/romeseed.co.git`).

---

## Step 2: Push This Code to GitHub

In your terminal:

```bash
# Navigate to this folder (romeseed-website)
cd /path/to/romeseed-website

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ROME Seed Co. website

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Add remote (paste your HTTPS URL from Step 1)
git remote add origin https://github.com/YOUR_USERNAME/romeseed.co.git

# Push to main
git branch -M main
git push -u origin main
```

---

## Step 3: Verify on GitHub

1. Go to your repo on github.com
2. Confirm you see:
   - ✓ `public/` folder
   - ✓ `tools/` folder with `check.js`
   - ✓ `package.json`
   - ✓ `wrangler.jsonc` (named `romeseed-website`)
   - ✓ `README.md`
   - ✓ `DEPLOYMENT_CHECKLIST.md`
   - ✓ `.gitignore`

---

## What to Change Before Design

These files have placeholder or generic content from Rooted Impact. **Replace them with ROME content:**

### HTML Pages

Replace these files in `public/` with ROME content:

- `index.html` — homepage
- `about.html` — about page
- `contact/index.html` — contact form page
- Any other pages specific to ROME

The Rooted Impact pages (services, packages, sectors) should be deleted or replaced with ROME pages.

### Images

Replace images in `public/assets/img/`:
- Hero backgrounds
- Product photos
- Logo variations
- Team photos

Current images are from Rooted Impact's photography.

### Styles

Update `public/assets/css/site.css` with ROME brand colors:

```css
/* ROME Color Palette */
--color-primary: #2C4C34;        /* Hemp Green */
--color-secondary: #B9A58A;      /* Regenerative Earth */
--color-accent: #C8A45E;         /* Omega Gold */
--color-text: #111111;           /* Seed Black */
--color-background: #F6EFE3;     /* Pasta Cream */
```

### Fonts

Replace fonts in `public/assets/fonts/`:
- Keep: Arial, Inter, Open Sans (generic, reusable)
- Add: Cormorant Garamond (ROME brand font for headlines)
- Verify in CSS that font-family references are correct

---

## What's Already Configured ✓

- ✓ Worker name: `romeseed-website` (matches wrangler.jsonc)
- ✓ Cloudflare security headers (_headers file)
- ✓ HubSpot form support (CSP allows forms)
- ✓ Cache policy (fonts/images immutable, CSS no-cache)
- ✓ Pre-flight checks (npm run check validates everything)
- ✓ .gitignore (excludes node_modules, logs, etc.)
- ✓ Deployment checklist (DEPLOYMENT_CHECKLIST.md)

---

## Next: Cloudflare Setup

**After content is ready and pushed to GitHub**, follow `DEPLOYMENT_CHECKLIST.md` to:

1. Set up Cloudflare Pages (connects GitHub to Cloudflare)
2. Migrate DNS records to Cloudflare
3. Switch nameservers
4. Go live at romeseed.co

---

## Command Reference

### Local testing (before push)

```bash
npm install                    # Install dependencies
npm run check                  # Validate everything
npm run dev                    # Preview locally at localhost:8787
```

### Pushing changes

```bash
git add public/                # Stage changes
git commit -m "Update [section]"
git push origin main          # Deploy (Cloudflare auto-deploys)
```

### Using GitHub web editor (no terminal needed)

1. github.com → your repo
2. Navigate to file you want to edit
3. Click pencil icon
4. Edit and commit to `main`
5. Done — auto-deploys in ~60 seconds

---

## Load-Bearing Details

**These are critical and shouldn't change:**

1. **Worker name in `wrangler.jsonc`:** Must match Cloudflare dashboard name exactly (`romeseed-website`)
2. **Build directory in `wrangler.jsonc`:** Must be `./public` (all site files go there)
3. **Security headers in `public/_headers`:** CSP rules for HubSpot (if using forms)
4. **Cache rules in `_headers`:**
   - Fonts/images: immutable, 1 year (never change)
   - CSS/JS: no-cache (check for updates)
5. **Pre-flight check in `tools/check.js`:** Catches common mistakes before deploy

---

## Contacts

**Matthew Thompson:** matthew@romeseed.co  
**Roberto Cristiano:** roberto@romeseed.co

---

**Questions?** See README.md and DEPLOYMENT_CHECKLIST.md for detailed guidance.
