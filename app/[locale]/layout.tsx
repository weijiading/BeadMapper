import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const locales = ['en', 'zh']; // 确保这里有你的语言列表

// 👇 注意这里的类型定义变化
export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>; // 1. 类型变成 Promise
}) {
  // 2. 先 await 解包 params
  const { locale } = await params;

  // 校验 Locale 是否合法
  if (!locales.includes(locale as any)) notFound();

  // 获取服务端翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}