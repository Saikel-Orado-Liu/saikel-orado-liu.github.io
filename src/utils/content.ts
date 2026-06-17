import { getCollection } from 'astro:content';
import type { Locale } from '../i18n';

const DEFAULT_LOCALE: Locale = 'zh-cn';

interface ContentEntry {
  id: string;
  data: {
    locale: string;
    draft?: boolean;
    date: Date;
    [key: string]: any;
  };
}

/** 获取指定 locale 的内容 + 默认语言回退，本地化版本优先 */
async function getLocalizedCollection(collection: any, locale: string) {
  const all = (await getCollection(collection, ({ data }: any) => !data.draft)) as ContentEntry[];
  const seen = new Set<string>();
  const result: ContentEntry[] = [];

  // 第一轮：匹配当前 locale（优先）
  for (const item of all) {
    if (item.data.locale === locale) {
      seen.add(item.id);
      result.push(item);
    }
  }

  // 第二轮：非默认语言时，补入默认语言中尚未覆盖的条目
  if (locale !== DEFAULT_LOCALE) {
    for (const item of all) {
      if (item.data.locale === DEFAULT_LOCALE && !seen.has(item.id)) {
        result.push(item);
      }
    }
  }

  return result.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getLocalizedPosts(locale: string, limit?: number) {
  const posts = await getLocalizedCollection('blog', locale);
  return limit ? posts.slice(0, limit) : posts;
}

export async function getLocalizedProjects(locale: string, limit?: number) {
  const projects = await getLocalizedCollection('projects', locale);
  // 过滤子文档：只保留顶层项目（flat file 或 与项目 slug 同名的文件）
  const filtered = projects.filter(p => {
    const segs = p.id.split('/');
    if (segs.length <= 1) return true;
    if (segs.length === 2 && segs[1] === segs[0]) return true; // texturge/texturge
    if (segs.length === 2 && segs[1] === 'index') return true; // 向后兼容
    return false;
  });
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getLocalizedPlugins(locale: string, limit?: number) {
  const plugins = await getLocalizedCollection('ue5-plugins', locale);
  return limit ? plugins.slice(0, limit) : plugins;
}

export async function getAllTags(locale: string) {
  const posts = await getLocalizedPosts(locale);
  const tagMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of (post.data.tags ?? []) as string[]) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }
  return [...tagMap.entries()].sort((a, b) => b[1] - a[1]);
}

export async function getPostsByTag(locale: string, tag: string) {
  const posts = await getLocalizedPosts(locale);
  return posts.filter(p => (p.data.tags as string[])?.includes(tag));
}

export async function getAllCategories(locale: string) {
  const posts = await getLocalizedPosts(locale);
  const catMap = new Map<string, number>();
  for (const post of posts) {
    for (const cat of (post.data.categories ?? []) as string[]) {
      catMap.set(cat, (catMap.get(cat) ?? 0) + 1);
    }
  }
  return [...catMap.entries()].sort((a, b) => b[1] - a[1]);
}

export async function getAdjacentPosts(locale: string, currentSlug: string) {
  const posts = await getLocalizedPosts(locale);
  const index = posts.findIndex(p => p.id === currentSlug);
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
