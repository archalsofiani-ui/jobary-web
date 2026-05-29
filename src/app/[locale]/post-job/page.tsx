import { unstable_setRequestLocale } from 'next-intl/server';
import { PostJobForm } from '@/components/employer/PostJobForm';

export default function PostJobPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <PostJobForm locale={locale} />
    </div>
  );
}
