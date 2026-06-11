import rss from '@astrojs/rss';
import { getLocalizedPosts } from '../../../utils/content';

export async function GET() {
  const posts = await getLocalizedPosts('ja-jp');
  return rss({
    title: 'Blog — GameGeek-Saikel',
    description: '技術記事と随想',
    site: 'https://saikel-orado-liu.github.io',
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/ja-jp/blog/${post.id}/`,
    })),
    stylesheet: '/rss/styles.xsl',
  });
}
