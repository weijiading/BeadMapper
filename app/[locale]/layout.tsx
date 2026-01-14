import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css"; 

// 字体设置
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 合并所有 metadata 设置
export const metadata: Metadata = {
  title: "BeadMapper",
  description: "Convert shoe sizes between US, EU, UK, and CM with precision. Free size converter tool for global shopping.",
  icons: {
    icon: [
      { url: '/favicon-16.ico', sizes: '16x16' },
      { url: '/favicon-32.ico', sizes: '32x32' },
      { url: '/favicon-48.ico', sizes: '48x48' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const runtime = 'edge';

// 国际化配置
const locales = ['en', 'zh'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;  // params 是 Promise
}) {
  // 使用 await 解包 Promise
  const { locale } = await params;

  // 确保 locale 有效
  if (!locales.includes(locale)) {
    notFound();
  }

  // 获取翻译文件
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}