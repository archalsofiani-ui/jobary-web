import { unstable_setRequestLocale } from 'next-intl/server';
import { EmployerOnboarding } from '@/components/onboarding/EmployerOnboarding';

export default function EmployerOnboardingPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <EmployerOnboarding locale={locale} />
    </div>
  );
}
