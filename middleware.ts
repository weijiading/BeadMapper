import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n'; // 这里的路径对应 src/i18n.ts

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，除了 api, _next, 静态文件等
  matcher: ['/', '/(zh|en)/:path*']
};