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
  isIndex: boolean;
  /** 章节序号（从文件名前缀解析） */
  chapterOrder: number;
  /** 章节 slug */
  chapterSlug: string;
  /** 文档序号 */
  docOrder: number;
  /** 文档 slug */
  docSlug: string;
  /** 当前 locale 的标题 */
  title: string;
  /** 该条目实际使用的 locale */
  locale: Locale;
}

export interface ChapterGroup {
  order: number;
  slug: string;
  titleKey: string;
  docs: DocNode[];
}

export interface DocRegistry {
  /** 项目标识 */
  projectSlug: string;
  /** 按序排列的章节组 */
  chapters: ChapterGroup[];
  /** 扁平排序的全部文档（用于前后篇导航） */
  flatList: DocNode[];
}

// ── ID 解析 ──────────────────────────────────────────────

const CHAPTER_RE = /^(\d{2})\.?([^/]+)/;
const DOC_RE     = /(\d{2})\.?([^./]+)$/;

/**
 * 从 collection entry id 解析文档树节点元信息。
 *
 * ID 格式：
 *   texturge/texturge                        → isIndex（文件名与项目 slug 同名）
 *   texturge/01.getting-started/01.overview  → chapterOrder=1, docOrder=1
 */
function parseDocId(id: string): {
  projectSlug: string;
  isIndex: boolean;
  chapterOrder: number;
  chapterSlug: string;
  docOrder: number;
  docSlug: string;
} | null {
  const parts = id.split('/');
  if (parts.length < 2) return null;

  const projectSlug = parts[0];
  const rest = parts.slice(1);

  // 项目首页：文件名与项目 slug 同名（如 texturge/texturge.md）
  if (rest.length === 1 && rest[0] === projectSlug) {
    return { projectSlug, isIndex: true, chapterOrder: 0, chapterSlug: '', docOrder: 0, docSlug: projectSlug };
  }

  // 向后兼容：旧 index.md 命名
  if (rest.length === 1 && rest[0] === 'index') {
    return { projectSlug, isIndex: true, chapterOrder: 0, chapterSlug: '', docOrder: 0, docSlug: projectSlug };
  }

  // chapter/doc
  if (rest.length === 2) {
    const chMatch = rest[0].match(CHAPTER_RE);
    const docMatch = rest[1].match(DOC_RE);
    if (chMatch && docMatch) {
      return {
        projectSlug,
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
 * 给定 locale 和项目 slug，返回匹配的文档列表。
 * 选中的文档优先匹配 locale，缺失时回退到 zh-cn。
 */
export async function getLocalizedDocEntries(
  projectSlug: string,
  locale: Locale,
): Promise<DocNode[]> {
  const all = await getCollection('projects', ({ data }: any) => !data.draft);
  if (!all.length) return [];

  // 筛选当前项目的文档
  const projectEntries = all.filter(e => e.id.startsWith(projectSlug + '/'));

  // 按 locale 分组：locale → entries
  const byLocale = new Map<string, typeof projectEntries>();
  for (const entry of projectEntries) {
    // 从最后一个文件名段提取 locale（glob 加载器可能吞掉点号）
    const fileName = entry.id.split('/').pop()!;
    const localeMatch = fileName.match(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/);
    const entryLocale = localeMatch ? localeMatch[2] : 'zh-cn';
    if (!byLocale.has(entryLocale)) byLocale.set(entryLocale, []);
    byLocale.get(entryLocale)!.push(entry);
  }

  // 构造结果：先取目标 locale，不足时从 zh-cn 补充
  const seen = new Set<string>();
  const result: DocNode[] = [];

  for (const loc of [locale, DEFAULT_LOCALE] as Locale[]) {
    const entries = byLocale.get(loc) ?? [];
    for (const entry of entries) {
      // 用不含 locale 后缀的 base id 去重
      const baseId = entry.id.replace(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/, '');
      if (seen.has(baseId)) continue;
      seen.add(baseId);

      const parsed = parseDocId(baseId);
      if (!parsed) continue;

      result.push({
        id: toUrlSlug(baseId),
        entry: entry,
        projectSlug: parsed.projectSlug,
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

  // 排序：index 排最前 → chapterOrder → docOrder
  result.sort((a, b) => {
    if (a.isIndex !== b.isIndex) return a.isIndex ? -1 : 1;
    if (a.chapterOrder !== b.chapterOrder) return a.chapterOrder - b.chapterOrder;
    return a.docOrder - b.docOrder;
  });

  return result;
}

// ── 注册表构建 ───────────────────────────────────────────

/**
 * 为指定 locale + 项目 slug 构建完整文档注册表。
 */
export async function buildDocRegistry(
  projectSlug: string,
  locale: Locale,
): Promise<DocRegistry> {
  const flatList = await getLocalizedDocEntries(projectSlug, locale);

  // 按 chapter 分组
  const chapterMap = new Map<string, { order: number; slug: string; docs: DocNode[] }>();
  for (const doc of flatList) {
    if (doc.isIndex) continue; // index 不进入章节组
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

  return { projectSlug, chapters, flatList };
}

// ── 导航查询 ─────────────────────────────────────────────

export interface AdjacentDocs {
  prev: DocNode | null;
  next: DocNode | null;
}

/**
 * 在扁平文档列表中找到当前文档的前后篇（跨章节）。
 */
export function getAdjacentDocs(flatList: DocNode[], currentId: string): AdjacentDocs {
  const idx = flatList.findIndex(d => d.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatList[idx - 1] : null,
    next: idx < flatList.length - 1 ? flatList[idx + 1] : null,
  };
}

/**
 * 构建当前文档的 h2/h3 目录树（从渲染后的 headings 数组中过滤）。
 */
export function buildToc(
  headings: { depth: number; slug: string; text: string }[],
  minDepth = 2,
  maxDepth = 3,
) {
  return headings.filter(h => h.depth >= minDepth && h.depth <= maxDepth);
}

/**
 * 生成文档面包屑数组。
 */
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
 * 将 entry ID 转为干净 URL slug（剥离数字前缀、点号和 locale 后缀）。
 *   texturge/01.getting-started/01.overview → texturge/getting-started/overview
 *   texturge/texturge → texturge
 */
export function toUrlSlug(entryId: string): string {
  return entryId
    // 1. 剥离 locale 后缀（可能带点也可能无点，glob 加载器会吞掉点号）
    .replace(/(\.|)(en-us|ja-jp|ko-kr|ar-sa|es-es|fr-fr|pt-pt|ru-ru|de-de)$/, '')
    // 2. 剥离 /index 或 /{projectSlug}（项目首页）
    .replace(/^([^/]+)\/(?:index|\1)$/, '$1')
    // 3. 剥离数字排序前缀（NN. 或 NN，glob 加载器吞点后无点）
    .replace(/\/(\d+)\./g, '/')
    .replace(/\/(\d+)(?=[a-zA-Z])/g, '/');
}

/**
 * 为 Astro getStaticPaths 生成所有项目页和文档页路径。
 * 用于 [...slug].astro 路由。
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
 * 优先精确匹配 locale 后缀，再回退无后缀版本。
 */
export async function getDocEntry(urlSlug: string, locale: Locale) {
  const allDocs = await getCollection('projects');
  const localeMatch = allDocs.find(e => {
    if (toUrlSlug(e.id) !== urlSlug) return false;
    // 检查 locale 后缀（带点或无点，glob 加载器可能吞点）
    return e.id.endsWith(`.${locale}`) || e.id.endsWith(locale);
  });
  if (localeMatch) return localeMatch;
  return allDocs.find(e => toUrlSlug(e.id) === urlSlug) ?? null;
}
