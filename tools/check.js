#!/usr/bin/env node
/* ROME Seed Co. — pre-flight check. Run `npm run check` before every push. */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const WORKER_NAME = 'romeseed-co';
const DOMAIN = 'romeseed.co';

let fail = 0, warn = 0;
const ok   = m => console.log('  ok    ' + m);
const bad  = m => { console.log('  FAIL  ' + m); fail++; };
const wrn  = m => { console.log('  warn  ' + m); warn++; };

console.log('\nROME Seed Co. — pre-flight\n');

/* ---------- 1. required files ---------- */
const REQUIRED = [
  'index.html',
  '404.html',
  '_headers',
  '_redirects',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'assets/img/hero.jpg',
  'assets/img/og-image.jpg',
  'assets/img/favicon-32.png',
  'assets/img/apple-touch-icon.png',
  'assets/img/logo-horizontal-hemp.png',
  'assets/img/logo-horizontal-cream.png',
];
REQUIRED.forEach(f =>
  fs.existsSync(path.join(PUB, f)) ? ok(f) : bad('missing ' + f)
);

/* ---------- 2. wrangler config ---------- */
const wr = fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
const nm = (wr.match(/"name"\s*:\s*"([^"]+)"/) || [])[1];
nm === WORKER_NAME
  ? ok('worker name: ' + nm)
  : bad(`worker name is "${nm}", expected ${WORKER_NAME}`);
/"directory"\s*:\s*"\.\/public"/.test(wr)
  ? ok('assets directory is ./public')
  : bad('assets.directory is not ./public');
/"not_found_handling"\s*:\s*"404-page"/.test(wr)
  ? ok('404 handling wired to 404.html')
  : wrn('not_found_handling is not "404-page"');

/* ---------- 3. collect pages ---------- */
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(PUB);

/* ---------- 4. every referenced local asset resolves ---------- */
/* Covers href="", src="" AND url() inside inline <style> blocks. */
let broken = 0, refs = 0;
for (const f of pages) {
  const raw = fs.readFileSync(f, 'utf8');
  // Drop data: URIs first — their inner url(#id) fragments are not file refs.
  const html = raw.replace(/data:[a-z/+.-]+[;,][^"')]*/gi, 'data:stripped');
  const found = [
    ...(html.match(/(?:href|src)="([^"]+)"/g) || []).map(s => s.split('"')[1]),
    ...(html.match(/url\(['"]?([^'")]+)['"]?\)/g) || [])
        .map(s => s.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')),
  ];
  for (const u of found) {
    if (/^(https?:|mailto:|tel:|#|%23|data:)/.test(u) || u === '') continue;
    refs++;
    const cands = u.startsWith('/')
      ? [path.join(PUB, u), path.join(PUB, u, 'index.html')]
      : [path.resolve(path.dirname(f), u)];
    if (!cands.some(c => fs.existsSync(c))) {
      bad(`broken reference ${u} in ${path.relative(PUB, f)}`);
      broken++;
    }
  }
}
if (broken === 0) ok(`${pages.length} page(s), ${refs} local references, none broken`);

/* ---------- 5. no orphaned images ---------- */
const allHtml = pages.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const imgDir = path.join(PUB, 'assets/img');
const ALLOWED_UNREFERENCED = new Set([
  'logo-vertical-hemp.png',   // brand asset, shipped for reuse
  'logo-vertical-cream.png',  // brand asset, shipped for reuse
  'icon-512.png',             // PWA / high-res icon
]);
if (fs.existsSync(imgDir)) {
  for (const f of fs.readdirSync(imgDir)) {
    if (ALLOWED_UNREFERENCED.has(f)) continue;
    if (!allHtml.includes(f)) wrn(`unreferenced image: assets/img/${f}`);
  }
}

/* ---------- 6. images stay external, never re-embedded ---------- */
const embedded = pages.filter(f =>
  /data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]{500,}/.test(fs.readFileSync(f, 'utf8'))
);
embedded.length === 0
  ? ok('no base64-embedded images (assets stay cacheable)')
  : embedded.forEach(f => bad(`large base64 image embedded in ${path.relative(PUB, f)}`));

/* ---------- 7. page weight ---------- */
for (const f of pages) {
  const kb = fs.statSync(f).size / 1024;
  if (kb > 150) wrn(`${path.relative(PUB, f)} is ${kb.toFixed(0)}KB — consider trimming`);
}

/* ---------- 8. sitemap ---------- */
const sm = fs.readFileSync(path.join(PUB, 'sitemap.xml'), 'utf8');
sm.includes(DOMAIN)
  ? ok(`sitemap uses ${DOMAIN}`)
  : bad('sitemap has the wrong domain');
for (const f of pages) {
  if (f.endsWith('404.html')) continue;
  const rel = '/' + path.relative(PUB, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (!sm.includes(rel)) wrn('not in sitemap: ' + rel);
}

/* ---------- 9. security headers present ---------- */
const hd = fs.readFileSync(path.join(PUB, '_headers'), 'utf8');
[
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Strict-Transport-Security',
].forEach(h => hd.includes(h) ? ok('header: ' + h) : bad('missing header: ' + h));

/* CSP must permit the Google Fonts the page actually loads. */
if (allHtml.includes('fonts.googleapis.com')) {
  hd.includes('fonts.googleapis.com') && hd.includes('fonts.gstatic.com')
    ? ok('CSP allows Google Fonts')
    : bad('page loads Google Fonts but CSP does not allow them');
}

/* ---------- 10. no stale references ---------- */
const STALE = ['rooted-impact', 'rootedimpactconsulting', 'squarespace', 'pages.dev', 'lorem ipsum'];
for (const f of pages) {
  const h = fs.readFileSync(f, 'utf8').toLowerCase();
  for (const s of STALE) {
    if (h.includes(s)) bad(`stale reference "${s}" in ${path.relative(PUB, f)}`);
  }
}
ok('no stale domain or placeholder references');

/* ---------- 11. unresolved copy placeholders ---------- */
for (const f of pages) {
  const h = fs.readFileSync(f, 'utf8');
  const ph = h.match(/\[[A-Z]{1,4}\]|\bTK\b|\bTBD\b|XXX/g);
  if (ph) wrn(`${path.relative(PUB, f)} has unresolved placeholders: ${[...new Set(ph)].join(', ')}`);
}

console.log(
  '\n' + (fail ? `${fail} failure(s)` : 'all checks passed') +
  (warn ? `, ${warn} warning(s)` : '') + '\n'
);
process.exit(fail ? 1 : 0);
