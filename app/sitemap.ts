import { MetadataRoute } from 'next';

const baseUrl = 'https://your-domain.com';
const locales = ['en', 'zh'];

export default function sitemap(): MetadataRoute.Sitemap {
  // 定义你的核心页面路径
  const routes = ['', '/editor']; 

  // 为每个页面、每个语言生成条目
  const sitemapEntries = routes.map((route) => {
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    }));
  }).flat();

  return sitemapEntries;
}