import createMiddleware from 'next-intl/middleware';

// 创建中间件实例
const middleware = createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

// 核心：Next.js 16 可能寻找名为 proxy 的导出，或者默认导出
// 这样写可以同时满足两者，最为保险
export default middleware;
export const proxy = middleware; 

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};