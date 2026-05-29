import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-jobary-dark text-gray-300 mt-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Briefcase className="h-6 w-6 text-blue-400" />
              <span>Jobary</span>
            </div>
            <p className="text-sm text-gray-400">{t('tagline')}</p>
          </div>

          {/* Seekers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t('for_seekers')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/jobs`} className="hover:text-white transition-colors">{t('browse_jobs')}</Link></li>
              <li><Link href={`/${locale}/signup?role=seeker`} className="hover:text-white transition-colors">{t('create_profile')}</Link></li>
              <li><Link href={`/${locale}/signup?role=seeker`} className="hover:text-white transition-colors">{t('upload_cv')}</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t('for_employers')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/post-job`} className="hover:text-white transition-colors">{t('post_job')}</Link></li>
              <li><Link href={`/${locale}/pricing`} className="hover:text-white transition-colors">{t('pricing')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Jobary. {t('rights')}</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-gray-300">Privacy Policy</Link>
            <Link href={`/${locale}/terms`}   className="hover:text-gray-300">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
