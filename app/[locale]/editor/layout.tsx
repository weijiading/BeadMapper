import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n'; // 确保引用了我们在上一步修复的 routing 配置
import "../globals.css"; // 假设 globals.css 在 app/ 目录下，使用 ../ 引用

// 字体设置
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 边缘运行时配置 (保留您原有的设置)
export const runtime = 'edge';

// 定义基础域名 (请修改为您实际的域名)
const baseUrl = 'https://your-domain.com';

// 1. 动态生成 Metadata (SEO 关键配置)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(baseUrl),
    title: "BeadMapper",
    description: "BeadMapper is a lightweight collection of practical online tools built for speed and simplicity.",
    icons: {
      icon: [
        { url: '/favicon-16.ico', sizes: '16x16' },
        { url: '/favicon-32.ico', sizes: '32x32' },
        { url: '/favicon-48.ico', sizes: '48x48' },
      ],
      apple: '/apple-touch-icon.png',
    },
    // hreflang 配置
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
      },
    },
  };
}

// 2. 布局组件
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 解包 params (Next.js 15 要求)
  const { locale } = await params;

  // 验证 locale 是否有效
  // 使用 routing.locales 替代硬编码的数组，保持一致性
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 获取翻译文件
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}