import { unstable_setRequestLocale } from 'next-intl/server';

export default function SignupPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
      <h1 className="text-2xl font-bold mb-2">Signup</h1>
      <p>Coming soon — Phase 2 &amp; 3.</p>
    </div>
  );
}
