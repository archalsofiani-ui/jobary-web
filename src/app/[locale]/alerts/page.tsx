import { unstable_setRequestLocale } from 'next-intl/server';
import { JobAlerts } from '@/components/notifications/JobAlerts';

export default function AlertsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <JobAlerts locale={locale} />
    </div>
  );
}
