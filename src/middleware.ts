import { defineMiddleware } from 'astro:middleware';

const LOCALE_MAP: Record<string, string> = {
  'zh-cn': 'zh-cn',
  'en-us': 'en-us',
  'ja-jp': 'ja-jp',
  'ko-kr': 'ko-kr',
  'ar-sa': 'ar-sa',
  'es-es': 'es-es',
  'fr-fr': 'fr-fr',
  'pt-pt': 'pt-pt',
  'ru-ru': 'ru-ru',
  'de-de': 'de-de',
};

/**
 * 中间件：将旧的大写 locale URL 301 重定向到全小写规范格式。
 * 例如 /en-US/blog/ → /en-us/blog/
 *
 * 语言自动检测由 BaseLayout 中的客户端脚本实现（navigator.language），
 * 因 Astro output: 'static' 模式下请求头不可用。
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  const match = pathname.match(/^\/([^\/]+?)(\/|$)/);
  if (match) {
    const segment = match[1];
    const lowerSegment = segment.toLowerCase();
    const normalized = LOCALE_MAP[lowerSegment];

    if (normalized && segment !== normalized) {
      const rest = pathname.slice(segment.length + 1) || '/';
      return context.redirect(`/${normalized}${rest}`, 301);
    }
  }

  return next();
});
