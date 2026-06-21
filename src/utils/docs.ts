import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n';

const DEFAULT_LOCALE: Locale = 'zh-cn';

// ── Types ────────────────────────────────────────────────

export interface DocNode {
  /** 不含 locale 后缀的 base ID（同时也是 URL 路径） */
  id: string;
  /** 原始 collection entry（包含 locale 后缀） */
  entry: CollectionEntry<'projects'>;
  projectSlug: string;
  /** 版本标识（如 "v1.0"），null 表示最新版 */
  version: string | null;
  isIndex: boolean;
  chapterOrder: number;
  chapterSlug: string;
  docOrder: number;
  docSlug: string;
  title: string;
  locale: Locale;
}

export interface ChapterGroup {
  order: number;
  slug: string;
  titleKey: string;
  docs: DocNode[];
}

export interface DocRegistry {
  projectSlug: string;
  /** 当前注册表对应的版本 */
  version: string | null;
  chapters: ChapterGroup[];
  flatList: DocNode[];
}

// ── 版本与 ID 解析 ──────────────────────────────────────

const CHAPTER_RE = /^(\d{2})\.?([^/]+)/;
const DOC_RE     = /(\d{2})\.?([^./]+)$/;
const VERSION_RE = /^v[^/]+$/;

/**
 * 从 entry ID 中提取项目 slug 和版本号。
 *   texturge/v1.0/01.getting-started/01.overview → { projectSlug: "texturge", version: "v1.0" }
 *   texturge/01.getting-started/01.overview       → { projectSlug: "texturge", version: null }
 *   texturge/texturge                             → { projectSlug: "texturge", version: null }
 */
export function parseProjectVersion(entryId: string): {
  projectSlug: string;
  version: string | null;
} {
  const parts = entryId.split('/');
  const projectSlug = parts[0];
  if (parts.length >= 2 && VERSION_RE.test(parts[1])) {
    return { projectSlug, version: parts[1] };
  }
  return { projectSlug, version: null };
}

/**
 * 从 collection entry id 解析文档树节点元信息。
 * 版本感知：跳过 ID 中的 v{X.Y} 段后再解析章节/文档。
 */
function parseDocId(id: string): {
  projectSlug: string;
  version: string | null;
  isIndex: boolean;
  chapterOrder: number;
  chapterSlug: string;
  docOrder: number;
  docSlug: string;
} | null {
  const parts = id.split('/');
  if (parts.length < 2) return null;

  const projectSlug = parts[0];
  let rest = parts.slice(1);

  // 提取版本段
  let version: string | null = null;
  if (rest.length >= 1 && VERSION_RE.test(rest[0])) {
    version = rest[0];
    rest = rest.slice(1);
  }

  // 项目首页：文件名与项目 slug 同名
  if (rest.length === 1 && (rest[0] === projectSlug || rest[0] === 'index')) {
    return { projectSlug, version, isIndex: true, chapterOrder: 0, chapterSlug: '', docOrder: 0, docSlug: projectSlug };
  }

  // chapter/doc
  if (rest.length === 2) {
    const chMatch = rest[0].match(CHAPTER_RE);
    const docMatch = rest[1].match(DOC_RE);
    if (chMatch && docMatch) {
      return {
        projectSlug,
        version,
        isIndex: false,
        chapterOrder: parseInt(chMatch[1], 10),
        chapterSlug: chMatch[2],
        docOrder: parseInt(docMatch[1], 10),
        docSlug: docMatch[2],
      };
    }
  }

  return null;
}

// ── 本地化筛选 ───────────────────────────────────────────

/**
 * Given locale, project slug, and optional version, returns matching doc list.
 * version=undefined returns only latest (no version subdirs).
 */
export async function getLocalizedDocEntries(
  projectSlug: string,
  locale: Locale,
  version?: string,
): Promise<DocNode[]> {
  const all = await getCollection('projects', ({ data }: any) => !data.draft);
  if (!all.length) return [];

  // 筛选当前项目 + 版本
  const projectEntries = all.filter(e => {
    if (!e.id.startsWith(projectSlug + '/')) return false;
    const pv = parseProjectVersion(e.id);
    if (version) return pv.version === version;
    return pv.version === null;
  });

  // 按 locale 分组
  const byLocale = new Map<string, typeof projectEntries>();
  for (const entry of projectEntries) {
    const fileName = entry.id.split('/').pop()!;
    const localeMatch = fileName.match(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/);
    const entryLocale = localeMatch ? localeMatch[2] : 'zh-cn';
    if (!byLocale.has(entryLocale)) byLocale.set(entryLocale, []);
    byLocale.get(entryLocale)!.push(entry);
  }

  const seen = new Set<string>();
  const result: DocNode[] = [];

  for (const loc of [locale, DEFAULT_LOCALE] as Locale[]) {
    const entries = byLocale.get(loc) ?? [];
    for (const entry of entries) {
      const baseId = entry.id.replace(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/, '');
      if (seen.has(baseId)) continue;
      seen.add(baseId);

      const parsed = parseDocId(baseId);
      if (!parsed) continue;

      result.push({
        id: toUrlSlug(baseId),
        entry,
        projectSlug: parsed.projectSlug,
        version: parsed.version,
        isIndex: parsed.isIndex,
        chapterOrder: parsed.chapterOrder,
        chapterSlug: parsed.chapterSlug,
        docOrder: parsed.docOrder,
        docSlug: parsed.docSlug,
        title: entry.data.title,
        locale: loc as Locale,
      });
    }
  }

  result.sort((a, b) => {
    if (a.isIndex !== b.isIndex) return a.isIndex ? -1 : 1;
    if (a.chapterOrder !== b.chapterOrder) return a.chapterOrder - b.chapterOrder;
    return a.docOrder - b.docOrder;
  });

  return result;
}

// ── 注册表构建 ───────────────────────────────────────────

export async function buildDocRegistry(
  projectSlug: string,
  locale: Locale,
  version?: string,
): Promise<DocRegistry> {
  const flatList = await getLocalizedDocEntries(projectSlug, locale, version);

  const chapterMap = new Map<string, { order: number; slug: string; docs: DocNode[] }>();
  for (const doc of flatList) {
    if (doc.isIndex) continue;
    const key = `${doc.chapterOrder}-${doc.chapterSlug}`;
    if (!chapterMap.has(key)) {
      chapterMap.set(key, { order: doc.chapterOrder, slug: doc.chapterSlug, docs: [] });
    }
    chapterMap.get(key)!.docs.push(doc);
  }

  const chapters: ChapterGroup[] = [...chapterMap.values()]
    .sort((a, b) => a.order - b.order)
    .map(ch => ({
      order: ch.order,
      slug: ch.slug,
      titleKey: `${projectSlug}-${ch.slug}`,
      docs: ch.docs,
    }));

  return { projectSlug, version: version ?? null, chapters, flatList };
}

// ── 版本查询 ─────────────────────────────────────────────

/**
 * 从项目索引文件的 frontmatter 读取版本信息。
 */
export async function getProjectVersions(projectSlug: string): Promise<{
  versions: string[];
  currentVersion: string;
} | null> {
  const all = await getCollection('projects');
  const index = all.find(e => {
    const pv = parseProjectVersion(e.id);
    if (pv.projectSlug !== projectSlug || pv.version !== null) return false;
    const parsed = parseDocId(e.id);
    return parsed?.isIndex;
  });
  if (!index) return null;
  const { versions, currentVersion } = index.data as any;
  if (!versions?.length || !currentVersion) return null;
  return { versions, currentVersion };
}

/**
 * 当切换版本时当前页面不存在，找到目标版本中同章节的第一个文档。
 */
export function findVersionFallback(
  currentDocId: string,
  _targetVersion: string | null,
  targetFlatList: DocNode[],
): string | null {
  const currentParsed = parseDocId(currentDocId);
  if (!currentParsed) return null;

  // 如果当前是索引页，返回目标版本的索引页
  if (currentParsed.isIndex) {
    const targetIndex = targetFlatList.find(d => d.isIndex);
    return targetIndex?.id ?? null;
  }

  // 找同章节的第一个文档
  const sameChapter = targetFlatList.filter(
    d => !d.isIndex && d.chapterSlug === currentParsed.chapterSlug
  );
  if (sameChapter.length > 0) {
    sameChapter.sort((a, b) => a.docOrder - b.docOrder);
    return sameChapter[0].id;
  }

  // 章节不存在，返回目标版本索引页
  const targetIndex = targetFlatList.find(d => d.isIndex);
  return targetIndex?.id ?? null;
}

// ── 导航查询 ─────────────────────────────────────────────

export interface AdjacentDocs {
  prev: DocNode | null;
  next: DocNode | null;
}

export function getAdjacentDocs(flatList: DocNode[], currentId: string): AdjacentDocs {
  const idx = flatList.findIndex(d => d.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatList[idx - 1] : null,
    next: idx < flatList.length - 1 ? flatList[idx + 1] : null,
  };
}

export function buildToc(
  headings: { depth: number; slug: string; text: string }[],
  minDepth = 2,
  maxDepth = 3,
) {
  return headings.filter(h => h.depth >= minDepth && h.depth <= maxDepth);
}

export function buildBreadcrumbs(registry: DocRegistry, currentId: string) {
  const doc = registry.flatList.find(d => d.id === currentId);
  if (!doc || doc.isIndex) return [{ label: '文档首页', slug: registry.projectSlug }];

  const chapter = registry.chapters.find(c => c.slug === doc.chapterSlug);
  return [
    { label: '文档首页', slug: registry.projectSlug },
    { label: chapter?.titleKey ?? doc.chapterSlug, slug: doc.chapterSlug },
    { label: doc.title, slug: doc.docSlug },
  ];
}

// ── 静态路径与 entry 查找 ─────────────────────────────────

/**
 * 将 entry ID 转为干净 URL slug。
 * 版本段（v1.0 等）保留在 URL 中。
 *   texturge/v1.0/01.getting-started/01.overview → texturge/v1.0/getting-started/overview
 *   texturge/01.getting-started/01.overview → texturge/getting-started/overview
 *   texturge/texturge → texturge
 */
export function toUrlSlug(entryId: string): string {
  const clean = entryId
    .replace(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/, '')
    .replace(/^([^/]+)\/(?:index|\1)$/, '$1');

  return clean.split('/').map((seg, i) => {
    if (i === 0) return seg;
    if (/^v\d/.test(seg)) return seg;
    return seg.replace(/^\d+\./, '').replace(/^\d+(?=[a-zA-Z])/, '');
  }).join('/');
}

/**
 * 为 Astro getStaticPaths 生成所有项目页和文档页路径（含版本路由）。
 */
export async function getProjectPaths(_locale: string) {
  const allEntries = await getCollection('projects', ({ data }: any) => !data.draft);
  const seen = new Set<string>();
  const paths: { params: { slug: string } }[] = [];

  for (const entry of allEntries) {
    const slug = toUrlSlug(entry.id);
    if (seen.has(slug)) continue;
    seen.add(slug);
    paths.push({ params: { slug } });
  }

  return paths;
}

/**
 * 根据干净 URL slug + locale 找到对应的 collection entry。
 */
export async function getDocEntry(urlSlug: string, locale: Locale) {
  const allDocs = await getCollection('projects');
  const localeMatch = allDocs.find(e => {
    if (toUrlSlug(e.id) !== urlSlug) return false;
    return e.id.endsWith(`.${locale}`) || e.id.endsWith(locale);
  });
  if (localeMatch) return localeMatch;
  return allDocs.find(e => toUrlSlug(e.id) === urlSlug) ?? null;
}

export function buildTocGroups(headings: { depth: number; slug: string; text: string }[]) {
  const toc = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
  const groups: { h2: any; h3s: any[] }[] = [];
  let cur: { h2: any; h3s: any[] } | null = null;
  for (const h of toc) {
    if (h.depth === 2) {
      cur = { h2: h, h3s: [] };
      groups.push(cur);
    } else if (h.depth === 3) {
      if (cur) cur.h3s.push(h);
      else groups.push({ h2: h, h3s: [] });
    }
  }
  return groups;
}
