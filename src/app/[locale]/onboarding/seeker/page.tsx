import { unstable_setRequestLocale } from 'next-intl/server';
import { SeekerOnboarding } from '@/components/onboarding/SeekerOnboarding';

export default function SeekerOnboardingPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SeekerOnboarding locale={locale} />
    </div>
  );
}
