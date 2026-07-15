import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

// Find the IndexNow key file (32-char hex .txt) in public/
const publicDir = 'public';
const keyFile = readdirSync(publicDir).find(f => /^[0-9a-f]{32}\.txt$/i.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found in public/ (expected a 32-hex-char .txt file)');
  process.exit(1);
}

const key = readFileSync(join(publicDir, keyFile), 'utf8').trim();
const host = 'saikel-orado-liu.github.io';
const keyLocation = `https://${host}/${keyFile}`;

// Recursively extract all <loc> URLs from a sitemap (or sitemap index)
function extractUrls(sitemapPath) {
  const content = readFileSync(sitemapPath, 'utf8');
  const baseDir = dirname(sitemapPath);

  // Check if it's a sitemap index (points to other sitemaps)
  const subSitemaps = [...content.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*<\/sitemap>/g)];
  if (subSitemaps.length > 0) {
    const urls = [];
    for (const [, loc] of subSitemaps) {
      // URL might be absolute like https://... or relative like sitemap-0.xml
      const subPath = loc.startsWith('http') ? join(baseDir, loc.replace(/^.*\//, '')) : join(baseDir, loc);
      urls.push(...extractUrls(subPath));
    }
    return urls;
  }

  // Regular sitemap with <url><loc> entries
  return [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

const sitemapIndex = 'dist/sitemap-index.xml';
const urls = extractUrls(sitemapIndex);

if (urls.length === 0) {
  console.log('No URLs found in sitemap, skipping IndexNow submission.');
  process.exit(0);
}

console.log(`Submitting ${urls.length} URLs to IndexNow...`);

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
});

if (response.ok) {
  console.log(`IndexNow API accepted the submission (HTTP ${response.status}).`);
} else {
  const text = await response.text();
  console.error(`IndexNow API returned HTTP ${response.status}: ${text}`);
  process.exit(1);
}
