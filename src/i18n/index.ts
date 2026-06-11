import zhCN from './zh-cn.json';
import enUS from './en-us.json';
import jaJP from './ja-jp.json';
import koKR from './ko-kr.json';
import arSA from './ar-sa.json';
import esES from './es-es.json';
import frFR from './fr-fr.json';
import ptPT from './pt-pt.json';
import ruRU from './ru-ru.json';
import deDE from './de-de.json';

// 所有支持的语言列表（数据驱动模式，全小写）
export const locales = ['zh-cn', 'en-us', 'ja-jp', 'ko-kr', 'ar-sa', 'es-es', 'fr-fr', 'pt-pt', 'ru-ru', 'de-de'] as const;

// 兼容别名
export const supportedLocales = locales;

// 从数组推导 Locale 联合类型
export type Locale = (typeof locales)[number];

// 默认语言（无 URL 前缀）
export const defaultLocale: Locale = 'zh-cn';

// 需要前缀的语言（非默认语言）
export const prefixedLocales = locales.filter(l => l !== defaultLocale);

// 构建动态正则：匹配所有带前缀的语言路径（不区分大小写）
const prefixPattern = prefixedLocales.map(l => l.replace(/-/g, '\\-')).join('|');
export const localeRegex = new RegExp(`^\\/(${prefixPattern})(?:\\/|$)`, 'i');

// 翻译字典
const dictionaries: Record<Locale, Record<string, string>> = {
  'zh-cn': zhCN,
  'en-us': enUS,
  'ja-jp': jaJP,
  'ko-kr': koKR,
  'ar-sa': arSA,
  'es-es': esES,
  'fr-fr': frFR,
  'pt-pt': ptPT,
  'ru-ru': ruRU,
  'de-de': deDE,
};

// 语言标签
export const localeLabels: Record<Locale, string> = {
  'zh-cn': '中文',
  'en-us': 'English',
  'ja-jp': '日本語',
  'ko-kr': '한국어',
  'ar-sa': 'العربية',
  'es-es': 'Español',
  'fr-fr': 'Français',
  'pt-pt': 'Português',
  'ru-ru': 'Русский',
  'de-de': 'Deutsch',
};

// 将任意大小写的 locale 规范化为 Locale 类型
export function normalizeLocale(raw: string | undefined): Locale {
  if (!raw) return defaultLocale;
  const lower = raw.toLowerCase();
  const found = locales.find(l => l.toLowerCase() === lower);
  return found ?? defaultLocale;
}

// 获取翻译函数
export function useTranslations(locale: string | undefined) {
  const localeKey = normalizeLocale(locale);
  const dict = dictionaries[localeKey] ?? dictionaries[defaultLocale];
  return function t(key: string): string {
    return dict[key] ?? dictionaries[defaultLocale][key] ?? key;
  };
}

// 从 URL 路径中解析当前语言（不区分大小写）
export function getLocaleFromPath(pathname: string): Locale {
  const match = pathname.match(localeRegex);
  if (match) {
    const found = locales.find(l => l.toLowerCase() === match[1].toLowerCase());
    return found ?? defaultLocale;
  }
  return defaultLocale;
}

// 构建本地化路径
export function localizedPath(pathname: string, locale: Locale): string {
  const bare = pathname.replace(localeRegex, '/') || '/';
  return locale === defaultLocale ? bare : `/${locale}${bare}`;
}

// 将 locale 转为 og:locale 格式（en_us → en_US）
export function toOgLocale(locale: Locale): string {
  const parts = locale.split('-');
  return `${parts[0]}_${(parts[1] || parts[0]).toUpperCase()}`;
}

// 获取 Date.toLocaleDateString 使用的 locale 参数
export function toDateLocale(locale: Locale): string {
  return locale;
}

// 获取文字方向
export function getLocaleDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar-sa' ? 'rtl' : 'ltr';
}

// 去除路径中的 locale 前缀
export function stripLocalePrefix(pathname: string): string {
  return pathname.replace(localeRegex, '/') || '/';
}
