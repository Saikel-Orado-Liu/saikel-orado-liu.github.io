import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// ---- Argument parsing ----
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i] || true;
  }
}
const previousUrlsPath = args['previous-urls'];
const saveUrlsPath = args['save-urls'];

// ---- Key file discovery ----
const publicDir = 'public';
const keyFile = readdirSync(publicDir).find(f => /^[0-9a-f]{32}\.txt$/i.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found in public/ (expected a 32-hex-char .txt file)');
  process.exit(1);
}

const key = readFileSync(join(publicDir, keyFile), 'utf8').trim();
const host = 'saikel-orado-liu.github.io';
const keyLocation = `https://${host}/${keyFile}`;

// ---- Sitemap parsing ----
function extractUrls(sitemapPath) {
  const content = readFileSync(sitemapPath, 'utf8');
  const baseDir = dirname(sitemapPath);

  // Sitemap index -> recurse into sub-sitemaps
  const subSitemaps = [...content.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*<\/sitemap>/g)];
  if (subSitemaps.length > 0) {
    const urls = [];
    for (const [, loc] of subSitemaps) {
      const subPath = loc.startsWith('http')
        ? join(baseDir, loc.replace(/^.*\//, ''))
        : join(baseDir, loc);
      urls.push(...extractUrls(subPath));
    }
    return urls;
  }

  // Regular sitemap with <url> entries — collect <loc> + optional <lastmod>
  const urlBlocks = [...content.matchAll(/<url>(.*?)<\/url>/gs)];
  return urlBlocks.map(block => {
    const loc = block[1].match(/<loc>([^<]+)<\/loc>/)?.[1] || '';
    const lastmod = block[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || '';
    return { url: loc, lastmod };
  }).filter(e => e.url);
}

const sitemapIndex = 'dist/sitemap-index.xml';
if (!existsSync(sitemapIndex)) {
  console.log('Sitemap not found at ' + sitemapIndex + ', skipping IndexNow submission.');
  process.exit(0);
}

const currentEntries = extractUrls(sitemapIndex);
if (currentEntries.length === 0) {
  console.log('No URLs found in sitemap, skipping IndexNow submission.');
  process.exit(0);
}

const currentUrls = currentEntries.map(e => e.url);
const currentMap = new Map(currentEntries.map(e => [e.url, e.lastmod]));

// ---- Compute diff ----
let submitUrls;

if (previousUrlsPath && existsSync(previousUrlsPath)) {
  const prev = JSON.parse(readFileSync(previousUrlsPath, 'utf8'));
  const prevUrls = new Set(prev.urls);
  const prevMap = new Map(prev.entries.map(e => [e.url, e.lastmod]));

  const added = currentUrls.filter(u => !prevUrls.has(u));
  const removed = prev.urls.filter(u => !currentMap.has(u));
  const modified = currentUrls.filter(u => prevUrls.has(u) && prevMap.get(u) !== currentMap.get(u));

  submitUrls = [...new Set([...added, ...removed, ...modified])];

  console.log(`Previous: ${prev.urls.length} URLs, Current: ${currentUrls.length} URLs`);
  console.log(`Added: ${added.length}, Removed: ${removed.length}, Modified: ${modified.length}`);
} else {
  submitUrls = currentUrls;
  console.log('No previous URL list found, submitting all ' + submitUrls.length + ' URLs.');
}

if (submitUrls.length === 0) {
  console.log('No URL changes detected, skipping IndexNow submission.');
  process.exit(0);
}

// ---- Save current URLs for next run ----
if (saveUrlsPath) {
  writeFileSync(saveUrlsPath, JSON.stringify({
    urls: currentUrls,
    entries: currentEntries,
    timestamp: new Date().toISOString()
  }));
  console.log(`Saved current URL list to ${saveUrlsPath}`);
}

console.log(`Submitting ${submitUrls.length} URLs to IndexNow...`);

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList: submitUrls.slice(0, 10000),  // safety cap
  }),
});

if (response.ok) {
  console.log(`IndexNow API accepted the submission (HTTP ${response.status}).`);
} else {
  const text = await response.text();
  console.error(`IndexNow API returned HTTP ${response.status}: ${text}`);
  process.exit(1);
}
