'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Badge, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, any> = {
  submitted: 'gray', viewed: 'blue', shortlisted: 'yellow',
  interview: 'blue', hired: 'green', rejected: 'red', withdrawn: 'gray',
};

export function SeekerApplications({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('applications')
        .select('*, jobs(title_en, title_ar, city, job_type, companies(name_en, name_ar))')
        .eq('seeker_id', user.id)
        .order('applied_at', { ascending: false });
      setApps(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const STATUS_AR: Record<string, string> = {
    submitted: 'مقدّم', viewed: 'تمت المشاهدة', shortlisted: 'في القائمة',
    interview: 'مقابلة', hired: 'تم توظيفك 🎉', rejected: 'مرفوض', withdrawn: 'سحبت',
  };

  const t = {
    title: rtl ? 'طلباتي' : 'My Applications',
    back: rtl ? 'رجوع' : 'Back',
    company: rtl ? 'الشركة' : 'Company',
    status: rtl ? 'الحالة' : 'Status',
    date: rtl ? 'التاريخ' : 'Date',
    empty: rtl ? 'لم تقدم على أي وظيفة بعد' : "You haven't applied to any jobs yet",
    browse: rtl ? 'تصفح الوظائف' : 'Browse Jobs',
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/dashboard/seeker`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className={cn('h-4 w-4', rtl && 'rotate-180')} />{t.back}
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">{t.title} ({apps.length})</h1>

      {apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600 mb-3">{t.empty}</p>
          <Link href={`/${locale}/jobs`} className="text-jobary-blue hover:underline text-sm">{t.browse}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => {
            const job = app.jobs;
            const title   = rtl && job?.title_ar ? job.title_ar : job?.title_en;
            const company = rtl && job?.companies?.name_ar ? job.companies.name_ar : job?.companies?.name_en;
            const date = new Date(app.applied_at).toLocaleDateString(rtl ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/${locale}/jobs/${app.job_id}`} className="font-semibold text-gray-900 hover:text-jobary-blue truncate block">{title}</Link>
                  <p className="text-sm text-gray-500">{company} · {job?.city}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={STATUS_COLORS[app.status] || 'gray'} className="text-xs">
                    {rtl ? STATUS_AR[app.status] : app.status}
                  </Badge>
                  <span className="text-xs text-gray-400 hidden sm:block">{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
