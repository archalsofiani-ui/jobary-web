import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { JobSearch } from '@/components/jobs/JobSearch';
import { Spinner } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Browse Jobs' };

export default function JobsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <JobSearch locale={locale} />
    </Suspense>
  );
}
