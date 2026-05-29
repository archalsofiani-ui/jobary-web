'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Banknote, Briefcase, Bookmark, BookmarkCheck, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Button, Spinner, Badge } from '@/components/ui';
import { getJob, applyToJob, toggleSaveJob, getSavedJobIds } from '@/lib/jobs';
import { createClient } from '@/lib/supabase/client';
import type { Job } from '@/lib/jobs';
import { cn } from '@/lib/utils';

const TYPE_AR: Record<string, string> = {
  'full-time': 'دوام كامل', 'part-time': 'دوام جزئي', 'contract': 'عقد', 'freelance': 'عمل حر',
};

export function JobDetail({ locale, jobId }: { locale: string; jobId: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [showCover, setShowCover] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [{ data }, savedIds, { data: { user: u } }] = await Promise.all([
        getJob(jobId),
        getSavedJobIds(),
        createClient().auth.getUser(),
      ]);
      setJob(data);
      setSaved(savedIds.includes(jobId));
      setUser(u);

      if (u) {
        const { data: app } = await createClient().from('applications')
          .select('id').eq('job_id', jobId).eq('seeker_id', u.id).single();
        if (app) setApplied(true);
      }
      setLoading(false);
    }
    load();
  }, [jobId]);

  async function handleApply() {
    if (!user) { router.push(`/${locale}/login`); return; }
    setApplying(true);
    const { error } = await applyToJob(jobId, coverNote);
    setApplying(false);
    if (!error) { setApplied(true); setShowCover(false); }
  }

  async function handleSave() {
    if (!user) { router.push(`/${locale}/login`); return; }
    await toggleSaveJob(jobId);
    setSaved(s => !s);
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>;

  const title   = rtl && job.title_ar ? job.title_ar : job.title_en;
  const desc    = rtl && job.description_ar ? job.description_ar : job.description_en;
  const reqs    = rtl && job.requirements_ar ? job.requirements_ar : job.requirements_en;
  const company = rtl && job.companies?.name_ar ? job.companies.name_ar : job.companies?.name_en;
  const typeLabel = rtl ? TYPE_AR[job.job_type] : job.job_type?.replace('-', ' ');
  const salary  = job.salary_min && job.salary_max
    ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
    : null;

  const t = {
    back: rtl ? 'رجوع للوظائف' : 'Back to Jobs',
    apply: rtl ? 'قدم الآن' : 'Apply Now',
    applied: rtl ? 'تم التقديم ✓' : 'Applied ✓',
    save: rtl ? 'حفظ' : 'Save',
    saved: rtl ? 'محفوظة' : 'Saved',
    about: rtl ? 'عن الوظيفة' : 'About the Role',
    reqs: rtl ? 'المتطلبات' : 'Requirements',
    aboutCo: rtl ? 'عن الشركة' : 'About the Company',
    coverLabel: rtl ? 'رسالة تقديم (اختياري)' : 'Cover note (optional)',
    coverPlaceholder: rtl ? 'أخبر صاحب العمل لماذا أنت مناسب لهذا الدور...' : 'Tell the employer why you\'re a great fit...',
    send: rtl ? 'إرسال الطلب' : 'Send Application',
    cancel: rtl ? 'إلغاء' : 'Cancel',
    loginToApply: rtl ? 'سجل دخولك للتقديم' : 'Log in to apply',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Back */}
      <Link href={`/${locale}/jobs`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className={cn('h-4 w-4', rtl && 'rotate-180')} />
        {t.back}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-jobary-light rounded-xl flex items-center justify-center text-jobary-blue font-bold text-xl shrink-0">
                  {(company || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-500 text-sm">{company}</p>
                </div>
              </div>
              <button onClick={handleSave}
                className={cn('p-2 rounded-full border transition-colors shrink-0',
                  saved ? 'border-jobary-blue text-jobary-blue bg-jobary-light' : 'border-gray-200 text-gray-400 hover:border-jobary-blue')}>
                {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{job.city}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{typeLabel}</span>
              {salary && <span className="flex items-center gap-1.5"><Banknote className="h-4 w-4 text-gray-400" />{salary}</span>}
              {job.experience_min > 0 && (
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />
                  {job.experience_min}+ {rtl ? 'سنوات خبرة' : 'yrs exp'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-3">{t.about}</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{desc}</div>
          </div>

          {reqs && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3">{t.reqs}</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{reqs}</div>
            </div>
          )}

          {/* Company */}
          {job.companies?.description_en && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3">{t.aboutCo}</h2>
              <p className="text-sm text-gray-700">
                {rtl && job.companies?.description_ar ? job.companies.description_ar : job.companies.description_en}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            {applied ? (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>{t.applied}</span>
              </div>
            ) : (
              <>
                {!showCover ? (
                  <Button fullWidth onClick={() => user ? setShowCover(true) : router.push(`/${locale}/login`)}
                    size="lg" className="gap-2">
                    <Send className="h-4 w-4" />
                    {user ? t.apply : t.loginToApply}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">{t.coverLabel}</p>
                    <textarea
                      value={coverNote} onChange={e => setCoverNote(e.target.value)}
                      placeholder={t.coverPlaceholder}
                      rows={4}
                      className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jobary-blue resize-none"
                    />
                    <Button fullWidth onClick={handleApply} loading={applying}>{t.send}</Button>
                    <Button fullWidth variant="ghost" size="sm" onClick={() => setShowCover(false)}>{t.cancel}</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
