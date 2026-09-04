# GitHub & Cloudflare Deployment Checklist

Follow these steps to deploy the ROME Seed Co. website.

---

## Phase 1: GitHub Setup

### 1.1 Create the repository

- [ ] Go to github.com → **New repository**
- [ ] Name: `romeseed.co` (or `rome-website`)
- [ ] Description: "ROME Seed Co. website — static site on Cloudflare"
- [ ] Public repository
- [ ] Initialize with README (skip — we have one)
- [ ] Create repository

### 1.2 Clone and push this code

```bash
# Clone the new repo
git clone https://github.com/YOUR_GITHUB_USERNAME/romeseed.co.git
cd romeseed.co

# Copy all files from this folder into the repo
cp -r /path/to/romeseed-website/* .

# Push to GitHub
git add .
git commit -m "Initial commit: ROME Seed Co. website"
git push -u origin main
```

### 1.3 Verify GitHub

- [ ] Go to github.com → your repo
- [ ] Confirm all files are there: `public/`, `tools/`, `.gitignore`, `wrangler.jsonc`, README.md
- [ ] Branch shows `main`

---

## Phase 2: Cloudflare Setup

### 2.1 Cloudflare account

- [ ] Create account at cloudflare.com (if needed)
- [ ] Verify email
- [ ] Free tier is fine

### 2.2 Add `romeseed.co` to Cloudflare

- [ ] Log into Cloudflare dashboard
- [ ] Click **+ Add a site**
- [ ] Enter: `romeseed.co`
- [ ] Select plan: **Free**
- [ ] Cloudflare scans current DNS (should find your Squarespace records)
- [ ] Accept the suggested DNS records

### 2.3 Migrate DNS records to Cloudflare

**Critical:** Do this before changing nameservers.

In Cloudflare dashboard → **DNS**:

**Add these records:**

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| MX | @ | aspmx.l.google.com (priority 5) | Auto | No |
| MX | @ | alt1.aspmx.l.google.com (priority 10) | Auto | No |
| MX | @ | alt2.aspmx.l.google.com (priority 20) | Auto | No |
| MX | @ | alt3.aspmx.l.google.com (priority 30) | Auto | No |
| MX | @ | alt4.aspmx.l.google.com (priority 40) | Auto | No |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Auto | No |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:matthew@romeseed.co | Auto | No |
| TXT | default._domainkey | (paste your DKIM record from Google Workspace) | Auto | No |

**Verify records are correct:**

```bash
nslookup -type=MX romeseed.co 1.1.1.1
# Should show 5 Google MX records

nslookup -type=TXT romeseed.co 1.1.1.1
# Should show SPF and DMARC
```

- [ ] All MX records match Google Workspace exactly
- [ ] SPF record present
- [ ] DKIM record present
- [ ] DMARC record present

### 2.4 Note Cloudflare nameservers

You'll need these in Step 2.7.

In Cloudflare dashboard → look for **Nameservers** section (or **Domain Registration**)

Copy the two nameservers (should look like):
- `ns-123.cloudflare.com`
- `ns-456.cloudflare.com`

- [ ] Nameserver 1: `_________________________`
- [ ] Nameserver 2: `_________________________`

### 2.5 Set up Cloudflare Pages (auto-deploy)

This connects your GitHub repo to Cloudflare.

- [ ] In Cloudflare dashboard → **Pages** (left sidebar)
- [ ] Click **Create a project**
- [ ] Select **Connect to Git**
- [ ] Authorize GitHub (one-time)
- [ ] Select repo: `romeseed.co` (or your repo name)
- [ ] Select branch: `main`
- [ ] **Build settings:**
  - Framework: `None` (static HTML)
  - Build command: (leave empty)
  - Build output directory: `public`
  - Root directory: `/`
  - Environment variables: (leave empty)
- [ ] Click **Save and deploy**

Cloudflare will:
- Deploy your site to a temporary URL like `romeseed-pages.pages.dev`
- Watch GitHub for pushes to `main`
- Re-deploy automatically (~60 seconds)

### 2.6 Verify Pages deployment

- [ ] Go to https://romeseed-pages.pages.dev (the temporary URL)
- [ ] You should see the ROME homepage
- [ ] Click around — test a few pages
- [ ] If 404, check Cloudflare Pages → **Deployments** tab for build errors

### 2.7 Point DNS to Cloudflare Pages

Now make the site live.

In Cloudflare dashboard → **DNS**:

Add or update the A/CNAME record:

**For root domain (`romeseed.co`):**

If Cloudflare offers an `ALIAS` or `CNAME` record for the root:

| Type | Name | Content | Proxied |
|------|------|---------|---------|
| CNAME | romeseed.co | romeseed-pages.pages.dev | Yes |

(If Cloudflare doesn't support CNAME at root, use an ALIAS record with the same target.)

- [ ] DNS record created and saved

### 2.8 Update nameservers at your registrar

**Critical step — this is irreversible.**

At your domain registrar (Google Domains):

- [ ] Log into Google Domains
- [ ] Select domain: `romeseed.co`
- [ ] Go to **DNS** or **Custom nameservers**
- [ ] Delete current nameservers (Squarespace ones)
- [ ] Add Cloudflare nameservers (from Step 2.4):
  - `ns-123.cloudflare.com`
  - `ns-456.cloudflare.com`
- [ ] Save changes

**Propagation:** DNS changes take 5 min to 24 hours (usually ~15 min).

### 2.9 Verify nameserver propagation

```bash
# Check in a terminal
watch -n 5 'nslookup romeseed.co 1.1.1.1'

# When this shows Cloudflare nameservers, you're live
```

- [ ] Nameservers have switched to Cloudflare
- [ ] Hard-reload browser: Cmd+Shift+R
- [ ] Site loads at https://romeseed.co

### 2.10 Verify email still works

- [ ] Send a test email to matthew@romeseed.co from an external account
- [ ] Email should arrive in inbox (not spam)
- [ ] Reply works

- [ ] Email delivery confirmed

---

## Phase 3: Verify Everything

### 3.1 Run pre-flight checks

```bash
cd /path/to/romeseed-website
npm install
npm run check
```

- [ ] All checks pass (no failures)
- [ ] Warnings are acceptable but review them

### 3.2 Test third-party requests

Open https://romeseed.co in Chrome:

- [ ] Right-click → **Inspect**
- [ ] Go to **Network** tab
- [ ] Hard-reload: Cmd+Shift+R
- [ ] Look for external requests
- [ ] Should see only HubSpot form script (js.hsforms.net) — nothing else

- [ ] Exactly one third-party request

### 3.3 Test all pages

- [ ] Homepage loads
- [ ] About page works
- [ ] All internal links work
- [ ] No broken images
- [ ] No console errors (F12 → Console)

### 3.4 Test contact forms

- [ ] Contact form loads
- [ ] Form fields appear
- [ ] Test form submission (check HubSpot for the entry)

- [ ] Forms working

### 3.5 Test on mobile

- [ ] Open https://romeseed.co on a phone
- [ ] Pages render correctly
- [ ] Navigation works
- [ ] Forms responsive

- [ ] Mobile experience confirmed

---

## Phase 4: Ongoing Updates

### Making changes

1. Edit a file in the `public/` folder
2. Commit and push to `main`:
   ```bash
   git add public/
   git commit -m "Update [section]"
   git push origin main
   ```
3. Cloudflare Pages auto-deploys in ~60 seconds
4. Hard-reload: Cmd+Shift+R
5. Site is live

### Using GitHub web editor (no terminal)

1. Go to github.com → your repo
2. Navigate to the file you want to edit
3. Click the pencil icon
4. Make changes
5. Commit directly to `main`
6. Wait 60 seconds for auto-deploy

---

## Troubleshooting

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Site not live at romeseed.co | Check Cloudflare Pages → Deployments for errors; verify DNS is pointing to Pages | Review Phase 2.7 and 2.8 |
| Old Squarespace content showing | Nameservers didn't fully switch; cached DNS | Hard-reload; wait 24 hours for TTL to expire |
| Email not working | MX records not in Cloudflare or incorrect | Verify Phase 2.3; check `nslookup -type=MX romeseed.co` |
| Form submissions missing | HubSpot CSP rules not in `_headers` | Check `public/_headers`; verify CSP allows js.hsforms.net |
| Images not loading | Wrong path or image not committed | Check `public/assets/img/` exists; hard-reload |
| CSS outdated | CSS caching issue | Hard-reload: Cmd+Shift+R; check `_headers` cache rule for CSS |

---

## Contacts

**Matthew Thompson:** matthew@romeseed.co  
**Roberto Cristiano:** roberto@romeseed.co

---

**Completed:** _______________  
**Date:** _______________
