import { unstable_setRequestLocale } from 'next-intl/server';
import { SeekerDashboard } from '@/components/dashboard/SeekerDashboard';

export default function SeekerDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <SeekerDashboard locale={locale} />;
}
