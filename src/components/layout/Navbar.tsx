'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Globe, Briefcase, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        supabase.from('users').select('role').eq('id', u.id).single()
          .then(({ data }) => setUserRole(data?.role || null));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (!session?.user) setUserRole(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function switchLanguage() {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  }

  const navLinks = [
    { href: `/${locale}/jobs`, label: t('jobs') },
    { href: `/${locale}/employers`, label: t('employers') },
  ];

  const dashboardHref = userRole === 'employer'
    ? `/${locale}/dashboard/employer`
    : `/${locale}/dashboard/seeker`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl text-jobary-blue">
            <Briefcase className="h-6 w-6" />
            <span>Jobary</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn('text-sm font-medium transition-colors hover:text-jobary-blue',
                  pathname.startsWith(link.href) ? 'text-jobary-blue' : 'text-gray-600')}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={switchLanguage}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-jobary-blue transition-colors">
              <Globe className="h-4 w-4" />
              <span>{t('language')}</span>
            </button>

            {user ? (
              <>
                <NotificationBell locale={locale} />
                <Link href={dashboardHref}>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`}><Button variant="ghost" size="sm">{t('login')}</Button></Link>
                <Link href={`/${locale}/signup`}><Button size="sm">{t('signup')}</Button></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block text-sm font-medium text-gray-700 py-2"
              onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          <hr className="border-gray-200" />
          <div className="flex flex-col gap-2 pt-1">
            {user ? (
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="sm" fullWidth>{t('dashboard')}</Button>
              </Link>
            ) : (
              <>
                <Link href={`/${locale}/login`} onClick={() => setMobileOpen(false)}><Button variant="outline" size="sm" fullWidth>{t('login')}</Button></Link>
                <Link href={`/${locale}/signup`} onClick={() => setMobileOpen(false)}><Button size="sm" fullWidth>{t('signup')}</Button></Link>
              </>
            )}
            <button onClick={switchLanguage} className="flex items-center gap-2 text-sm text-gray-600 py-1">
              <Globe className="h-4 w-4" /> {t('language')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
