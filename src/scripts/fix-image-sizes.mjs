import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
let updated = 0;

async function processDir(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { await processDir(full); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(full, 'utf8');
    if (!html.includes('data-astro-image')) continue;
    const next = html.replace(
      /<img\s[^>]*data-astro-image[^>]*>/g,
      (tag) => tag.replace(/\bsizes="[^"]*"/, 'sizes="720px"')
    );
    if (next !== html) { await writeFile(full, next, 'utf8'); updated++; }
  }
}

await processDir(dist);
console.log(`[image-sizes] Updated ${updated} HTML files`);
