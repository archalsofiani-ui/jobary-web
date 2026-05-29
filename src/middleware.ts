import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

const PROTECTED = ['/dashboard', '/onboarding'];
const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check path
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

  const isProtected = PROTECTED.some(p => pathWithoutLocale.startsWith(p));
  const isAuthPage  = AUTH_PAGES.some(p => pathWithoutLocale.startsWith(p));

  if (isProtected || isAuthPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    const locale = pathname.split('/')[1] || defaultLocale;

    if (isProtected && !user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    if (isAuthPage && user) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard/seeker`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
