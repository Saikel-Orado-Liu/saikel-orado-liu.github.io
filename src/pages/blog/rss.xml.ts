import rss from '@astrojs/rss';
import { getLocalizedPosts } from '../../utils/content';

export async function GET() {
  const posts = await getLocalizedPosts('zh-cn');
  return rss({
    title: 'Blog — GameGeek-Saikel',
    description: '技术文章与随想',
    site: 'https://saikel-orado-liu.github.io',
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/blog/${post.id}/`,
    })),
    stylesheet: '/rss/styles.xsl',
  });
}
