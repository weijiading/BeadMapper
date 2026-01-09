import createMiddleware from 'next-intl/middleware';

const middleware = createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

export default middleware;

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
