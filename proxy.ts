// 1. 导入函数名改为 createProxy
import createProxy from 'next-intl/middleware';

// 2. 创建代理实例 (保持原有配置)
const proxy = createProxy({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

// 3. 仅默认导出 proxy 实例 (关键！！删除旧的 middleware 相关导出)
export default proxy;

// 4. 配置保留，规则不变
export const config = {
  // 此配置确保静态文件、API路由等不被国际化中间件处理
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};