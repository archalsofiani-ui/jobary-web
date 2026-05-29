import { unstable_setRequestLocale } from 'next-intl/server';
import { ApplicantsList } from '@/components/employer/ApplicantsList';

export default function ApplicantsPage({ params: { locale, jobId } }: { params: { locale: string; jobId: string } }) {
  unstable_setRequestLocale(locale);
  return <ApplicantsList locale={locale} jobId={jobId} />;
}
