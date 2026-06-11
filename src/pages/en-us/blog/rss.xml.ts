import rss from '@astrojs/rss';
import { getLocalizedPosts } from '../../../utils/content';

export async function GET() {
  const posts = await getLocalizedPosts('en-us');
  return rss({
    title: 'Blog — GameGeek-Saikel',
    description: 'Tech articles and thoughts',
    site: 'https://saikel-orado-liu.github.io',
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/en-us/blog/${post.id}/`,
    })),
    stylesheet: '/rss/styles.xsl',
  });
}
