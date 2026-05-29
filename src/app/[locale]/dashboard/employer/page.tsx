import { unstable_setRequestLocale } from 'next-intl/server';
import { EmployerDashboard } from '@/components/employer/EmployerDashboard';

export default function EmployerDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <EmployerDashboard locale={locale} />;
}
