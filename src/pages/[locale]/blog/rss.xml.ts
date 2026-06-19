import rss from '@astrojs/rss';
import { getLocalizedPosts } from '@/utils/content';
import type { Locale } from '@/i18n';

export function getStaticPaths() {
  return ['en-us','ja-jp','ko-kr','ar-sa','es-es','fr-fr','pt-pt','ru-ru','de-de'].map(locale => ({ params: { locale } }));
}

export async function GET({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const posts = await getLocalizedPosts(locale);
  return rss({
    title: 'Blog — GameGeek-Saikel',
    description: 'Tech articles and thoughts',
    site: 'https://saikel-orado-liu.github.io',
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/${locale}/blog/${post.id}/`,
    })),
    stylesheet: '/rss/styles.xsl',
  });
}
