import { unstable_setRequestLocale } from 'next-intl/server';
import { SignupFlow } from '@/components/auth/SignupFlow';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign Up' };

export default function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SignupFlow locale={locale} />
    </div>
  );
}
