import { unstable_setRequestLocale } from 'next-intl/server';
import { LoginFlow } from '@/components/auth/LoginFlow';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LoginFlow locale={locale} />
    </div>
  );
}
