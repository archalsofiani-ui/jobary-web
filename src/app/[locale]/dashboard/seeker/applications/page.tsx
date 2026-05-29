import { unstable_setRequestLocale } from 'next-intl/server';
import { SeekerApplications } from '@/components/dashboard/SeekerApplications';

export default function ApplicationsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <SeekerApplications locale={locale} />;
}
