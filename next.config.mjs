import createNextIntlPlugin from 'next-intl/plugin';

// 这里会自动找你的 ./i18n.ts 或 ./src/i18n/request.ts
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ 绝对不要加 output: 'export'
  
  // ✅ 必须加这个！
  // Cloudflare 免费版没有 Node.js 图片处理库，不加这行，你的图片加载时会报 500 错误
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);