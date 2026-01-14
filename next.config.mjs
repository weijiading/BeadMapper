// Path: next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

// 👇 修复：在括号中明确传入你的文件路径 './i18n.ts'
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 其他配置...
};

export default withNextIntl(nextConfig);