import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
// 注意：因为我们在 [locale] 文件夹内，所以路径变成了 ../globals.css
import "../globals.css"; 

export const runtime = 'edge';

// 1. 从旧文件迁移来的字体设置
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. 从旧文件迁移来的 Metadata
export const metadata: Metadata = {
  title: "ShoeSize - Smart Shoe Size Converter",
  description: "Convert shoe sizes between US, EU, UK, and CM with precision. Free size converter tool for global shopping.",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 确保 locale 有效
  if (!['en', 'zh'].includes(locale)) {
    notFound();
  }

  // 获取翻译文件
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* 3. 在这里合并字体变量和 class */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}