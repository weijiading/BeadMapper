import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en' as const;

// 注意这里解构的是 requestLocale，不再是 locale
export default getRequestConfig(async ({ requestLocale }) => {
  // 这一步是必须的：等待 Promise 解析拿到当前的语言
  let locale = await requestLocale;

  // 如果没有拿到语言，或者语言不在我们的列表里，就用默认语言
  // (当然你也可以选择保留 notFound()，但用默认语言更稳妥)
  if (!locale || !locales.includes(locale as typeof locales[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});