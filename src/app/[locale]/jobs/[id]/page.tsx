import { unstable_setRequestLocale } from 'next-intl/server';
import { JobDetail } from '@/components/jobs/JobDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Job Details' };

export default function JobDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  unstable_setRequestLocale(locale);
  return <JobDetail locale={locale} jobId={id} />;
}
