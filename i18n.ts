import { getRequestConfig } from 'next-intl/server';
import { defineRouting } from 'next-intl/routing';

// 1. 定义路由配置 (导出 routing 供 middleware 使用)
export const routing = defineRouting({
  // 支持的语言列表
  locales: ['en', 'zh'],
  // 默认语言
  defaultLocale: 'en'
});

// 2. 加载翻译文件
export default getRequestConfig(async ({ requestLocale }) => {
  // 验证传入的 locale 是否有效
  let locale = await requestLocale;

  // 如果 locale 无效或未定义，回退到默认语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 动态导入 messages 目录下的翻译文件
    messages: (await import(`./messages/${locale}.json`)).default
  };
});