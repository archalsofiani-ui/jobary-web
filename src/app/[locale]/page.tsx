import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Briefcase } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { SECTORS } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: t('hero_title') };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t  = useTranslations('home');
  const ts = useTranslations('sectors');

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-jobary-blue to-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{t('hero_title')}</h1>
          <p className="text-lg text-blue-200 mb-10">{t('hero_subtitle')}</p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-3 shadow-xl flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className="w-full text-gray-900 text-sm focus:outline-none"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-200" />
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t('location_placeholder')}
                className="w-full text-gray-900 text-sm focus:outline-none"
              />
            </div>
            <Link href={`/${locale}/jobs`}>
              <Button size="lg" className="w-full md:w-auto rounded-xl whitespace-nowrap">
                {t('search_btn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTORS ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('sectors_title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {SECTORS.map(sector => (
            <Link
              key={sector.key}
              href={`/${locale}/jobs?sector=${sector.key}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-jobary-blue hover:shadow-md transition-all group"
            >
              <span className="text-3xl">{sector.icon}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-jobary-blue text-center">
                {ts(sector.key)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOR EMPLOYERS CTA ────────────────────────────────── */}
      <section className="bg-jobary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-jobary-blue rounded-full p-3">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-jobary-dark">{t('for_employers')}</h3>
              <p className="text-gray-600 text-sm mt-0.5">Reach thousands of qualified candidates</p>
            </div>
          </div>
          <Link href={`/${locale}/post-job`}>
            <Button size="lg" className="gap-2">
              {t('post_job_cta')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
