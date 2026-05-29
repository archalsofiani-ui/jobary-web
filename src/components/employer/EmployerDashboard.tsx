'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Users, Eye, Pencil, ToggleLeft, ToggleRight, LogOut } from 'lucide-react';
import { Button, Badge, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function EmployerDashboard({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/${locale}/login`); return; }

      const { data: co } = await supabase.from('companies').select('*').eq('owner_id', user.id).single();
      if (!co) { router.push(`/${locale}/onboarding/employer`); return; }
      setCompany(co);

      const { data: jobList } = await supabase
        .from('jobs').select('*, applications(count)')
        .eq('company_id', co.id)
        .order('created_at', { ascending: false });
      setJobs(jobList || []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleStatus(jobId: string, current: string) {
    const supabase = createClient();
    const newStatus = current === 'active' ? 'paused' : 'active';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
  }

  const t = {
    welcome: rtl ? 'مرحباً' : 'Welcome',
    postJob: rtl ? 'نشر وظيفة' : 'Post a Job',
    myJobs: rtl ? 'وظائفي' : 'My Jobs',
    applicants: rtl ? 'المتقدمون' : 'Applicants',
    views: rtl ? 'مشاهدات' : 'Views',
    active: rtl ? 'نشطة' : 'Active',
    paused: rtl ? 'موقوفة' : 'Paused',
    edit: rtl ? 'تعديل' : 'Edit',
    noJobs: rtl ? 'لم تنشر أي وظائف بعد' : "You haven't posted any jobs yet",
    postFirst: rtl ? 'انشر أول وظيفة' : 'Post your first job',
    logout: rtl ? 'تسجيل الخروج' : 'Log out',
  };

  if (loading) return <div className="flex justify-center min-h-screen items-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-jobary-blue font-bold">
            <Briefcase className="h-5 w-5" /><span>Jobary</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {company?.name_en || company?.name_ar}
            </span>
            <button onClick={async () => { await signOut(); router.push(`/${locale}`); }}
              className="text-gray-500 hover:text-red-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t.myJobs}</h1>
          <Link href={`/${locale}/post-job`}>
            <Button className="gap-2"><Plus className="h-4 w-4" />{t.postJob}</Button>
          </Link>
        </div>

        {/* Jobs list */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-4">{t.noJobs}</p>
            <Link href={`/${locale}/post-job`}>
              <Button className="gap-2"><Plus className="h-4 w-4" />{t.postFirst}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => {
              const appCount = job.applications?.[0]?.count || 0;
              return (
                <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{job.title_en}</h3>
                      <Badge variant={job.status === 'active' ? 'green' : 'gray'} className="shrink-0">
                        {job.status === 'active' ? t.active : t.paused}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{job.city} · {job.sector} · {job.job_type}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />{appCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />{job.views_count || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/${locale}/dashboard/employer/applicants/${job.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Users className="h-3.5 w-3.5" />{t.applicants}
                      </Button>
                    </Link>
                    <button onClick={() => toggleStatus(job.id, job.status)}
                      className={`p-1.5 rounded-lg border transition-colors ${job.status === 'active' ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
                      {job.status === 'active' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
