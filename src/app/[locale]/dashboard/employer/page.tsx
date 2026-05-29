import { unstable_setRequestLocale } from 'next-intl/server';

export default function EmployerDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
      <p className="text-gray-500">Job posting and applicant management — coming in Phase 3.</p>
    </div>
  );
}
