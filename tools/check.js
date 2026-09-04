#!/usr/bin/env node
/* Pre-flight check. Run `npm run check` before pushing. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..'),P=path.join(R,'public');
let fail=0,warn=0;
const ok=m=>console.log('  ok    '+m), bad=m=>{console.log('  FAIL  '+m);fail++;}, wrn=m=>{console.log('  warn  '+m);warn++;};

console.log('\nROME Seed Co. site — pre-flight\n');

// 1. required files
['index.html','404.html','_headers','robots.txt','sitemap.xml','assets/site.css','assets/fonts.css','assets/leaf-mark-deepteal.png','assets/leaf-mark-gradient.png','ds/styles.css','assets/nav.js']
  .forEach(f=>fs.existsSync(path.join(P,f))?ok(f):bad('missing '+f));

// 2. worker name must match the Cloudflare dashboard
const wr=fs.readFileSync(path.join(R,'wrangler.jsonc'),'utf8');
const nm=(wr.match(/"name"\s*:\s*"([^"]+)"/)||[])[1];
nm==='romeseed-co'?ok('worker name: '+nm):bad('worker name is "'+nm+'", expected romeseed-co');
/"directory"\s*:\s*"\.\/public"/.test(wr)?ok('assets directory'):bad('assets.directory is not ./public');

// 3. links
const pages=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,e.name); e.isDirectory()?walk(p):e.name.endsWith('.html')&&pages.push(p);}})(P);
let broken=0;
for(const f of pages){
  const html=fs.readFileSync(f,'utf8');
  for(const h of html.match(/(?:href|src)="([^"]+)"/g)||[]){
    const u=h.split('"')[1];
    if(/^(https?:|mailto:|#|data:)/.test(u))continue;
    const cands=u.startsWith('/')
      ? [path.join(P,u),path.join(P,u,'index.html')]
      : [path.resolve(path.dirname(f),u)];
    if(!cands.some(c=>fs.existsSync(c))){console.log('  FAIL  broken link '+u+' in '+path.relative(P,f));broken++;fail++;}
  }
}
broken===0&&ok(pages.length+' pages, no broken internal links');

// 4. sitemap covers real pages
const sm=fs.readFileSync(path.join(P,'sitemap.xml'),'utf8');
for(const f of pages){
  const rel='/'+path.relative(P,f).replace(/index\.html$/,'').replace(/\\/g,'/');
  if(f.endsWith('404.html'))continue;
  sm.includes(rel)||wrn('not in sitemap: '+rel);
}
sm.includes('romeseed.co')?ok('sitemap uses the romeseed.co domain'):bad('sitemap has the wrong domain');

// 5. no wrong-domain references anywhere
for(const f of pages){
  const h=fs.readFileSync(f,'utf8');
  if(/rooted-impact/.test(h)||/rootedimpactconsulting/.test(h))bad('references old domain in '+path.relative(P,f));
}
ok('no stale domain references');

console.log('\n'+(fail?`${fail} failure(s)`:'all checks passed')+(warn?`, ${warn} warning(s)`:'')+'\n');
process.exit(fail?1:0);
