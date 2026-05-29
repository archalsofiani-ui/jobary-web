'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ChevronDown } from 'lucide-react';
import { Badge, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const STATUSES = ['submitted', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected'] as const;
type Status = typeof STATUSES[number];

const STATUS_COLORS: Record<Status, 'gray' | 'blue' | 'green' | 'yellow' | 'red'> = {
  submitted: 'gray', viewed: 'blue', shortlisted: 'yellow',
  interview: 'blue', hired: 'green', rejected: 'red',
};
const STATUS_AR: Record<Status, string> = {
  submitted: 'مقدّم', viewed: 'تمت المشاهدة', shortlisted: 'في القائمة',
  interview: 'مقابلة', hired: 'تم التوظيف', rejected: 'مرفوض',
};

export function ApplicantsList({ locale, jobId }: { locale: string; jobId: string }) {
  const rtl = locale === 'ar';
  const [job, setJob] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: jobData }, { data: appData }] = await Promise.all([
        supabase.from('jobs').select('title_en, title_ar').eq('id', jobId).single(),
        supabase.from('applications')
          .select('*, seeker_profiles(name_en, name_ar, city, nationality, skills, years_exp, cv_url)')
          .eq('job_id', jobId)
          .order('applied_at', { ascending: false }),
      ]);
      setJob(jobData);
      setApps(appData || []);
      setLoading(false);

      // Mark viewed
      const supabase2 = createClient();
      await Promise.all(
        (appData || []).filter(a => a.status === 'submitted').map(a =>
          supabase2.from('applications').update({ status: 'viewed' }).eq('id', a.id)
        )
      );
    }
    load();
  }, [jobId]);

  async function updateStatus(appId: string, status: Status) {
    setUpdating(appId);
    await createClient().from('applications').update({ status }).eq('id', appId);
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    setUpdating(null);
  }

  const t = {
    back: rtl ? 'رجوع' : 'Back',
    applicants: rtl ? 'المتقدمون' : 'Applicants',
    name: rtl ? 'الاسم' : 'Name',
    status: rtl ? 'الحالة' : 'Status',
    city: rtl ? 'المدينة' : 'City',
    exp: rtl ? 'الخبرة' : 'Exp',
    cv: rtl ? 'السيرة' : 'CV',
    noApps: rtl ? 'لا يوجد متقدمون بعد' : 'No applicants yet',
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const jobTitle = rtl && job?.title_ar ? job.title_ar : job?.title_en;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      <Link href={`/${locale}/dashboard/employer`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className={cn('h-4 w-4', rtl && 'rotate-180')} />{t.back}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.applicants}</h1>
          <p className="text-sm text-gray-500">{jobTitle} · {apps.length}</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <p>{t.noApps}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">{t.name}</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600 hidden md:table-cell">{t.city}</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">{t.exp}</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">{t.status}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map(app => {
                const profile = app.seeker_profiles;
                const name = rtl && profile?.name_ar ? profile.name_ar : profile?.name_en || '—';
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-jobary-light flex items-center justify-center text-jobary-blue font-bold text-xs shrink-0">
                          {name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">{profile?.nationality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{profile?.city || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {profile?.years_exp != null ? `${profile.years_exp} yrs` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={app.status}
                          disabled={updating === app.id}
                          onChange={e => updateStatus(app.id, e.target.value as Status)}
                          className="text-xs rounded-full px-2 py-1 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-jobary-blue appearance-none pr-6 cursor-pointer"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{rtl ? STATUS_AR[s] : s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {profile?.cv_url && (
                        <a href={`https://rxzbtatmbvnpnunppahu.supabase.co/storage/v1/object/public/cvs/${profile.cv_url}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-jobary-blue hover:text-blue-800">
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
