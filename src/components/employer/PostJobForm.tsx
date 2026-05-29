'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { SECTORS_EN, SECTORS_AR, CITIES_EN, CITIES_AR, JOB_TYPES_EN, JOB_TYPES_AR } from '@/lib/jobs';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

export function PostJobForm({ locale, editJob }: { locale: string; editJob?: any }) {
  const rtl = locale === 'ar';
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title_en: editJob?.title_en || '',
    title_ar: editJob?.title_ar || '',
    sector: editJob?.sector || '',
    city: editJob?.city || '',
    job_type: editJob?.job_type || 'full-time',
    salary_min: editJob?.salary_min?.toString() || '',
    salary_max: editJob?.salary_max?.toString() || '',
    experience_min: editJob?.experience_min?.toString() || '0',
    description_en: editJob?.description_en || '',
    description_ar: editJob?.description_ar || '',
    requirements_en: editJob?.requirements_en || '',
    requirements_ar: editJob?.requirements_ar || '',
  });

  const sectors  = rtl ? SECTORS_AR  : SECTORS_EN;
  const cities   = rtl ? CITIES_AR   : CITIES_EN;
  const jobTypes = rtl ? JOB_TYPES_AR : JOB_TYPES_EN;

  const t = {
    title: rtl ? (editJob ? 'تعديل الوظيفة' : 'نشر وظيفة جديدة') : (editJob ? 'Edit Job' : 'Post a New Job'),
    step: rtl ? 'خطوة' : 'Step',
    of: rtl ? 'من' : 'of',
    next: rtl ? 'التالي' : 'Next',
    back: rtl ? 'رجوع' : 'Back',
    publish: rtl ? 'نشر الوظيفة' : 'Publish Job',
    // Step 1
    s1: rtl ? 'معلومات الوظيفة' : 'Job Information',
    titleEn: 'Job Title (English)',
    titleAr: 'المسمى الوظيفي (عربي)',
    sector: rtl ? 'القطاع' : 'Sector',
    city: rtl ? 'المدينة' : 'City',
    type: rtl ? 'نوع الوظيفة' : 'Job Type',
    salMin: rtl ? 'الراتب الأدنى (ريال)' : 'Min Salary (SAR)',
    salMax: rtl ? 'الراتب الأقصى (ريال)' : 'Max Salary (SAR)',
    exp: rtl ? 'الحد الأدنى للخبرة (سنوات)' : 'Min Experience (years)',
    // Step 2
    s2: rtl ? 'وصف الوظيفة' : 'Job Description',
    descEn: 'Description (English)',
    descAr: 'الوصف (عربي)',
    reqEn: 'Requirements (English)',
    reqAr: 'المتطلبات (عربي)',
    // Step 3
    s3: rtl ? 'مراجعة ونشر' : 'Review & Publish',
    selectSector: rtl ? 'اختر القطاع' : 'Select sector',
    selectCity: rtl ? 'اختر المدينة' : 'Select city',
    selectType: rtl ? 'اختر النوع' : 'Select type',
  };

  async function handlePublish() {
    setError('');
    if (!form.title_en || !form.description_en || !form.sector || !form.city) {
      setError(rtl ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    // Get company
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) {
      router.push(`/${locale}/onboarding/employer`);
      return;
    }

    const payload = {
      company_id: company.id,
      title_en: form.title_en,
      title_ar: form.title_ar || null,
      description_en: form.description_en,
      description_ar: form.description_ar || null,
      requirements_en: form.requirements_en || null,
      requirements_ar: form.requirements_ar || null,
      sector: form.sector,
      city: form.city,
      job_type: form.job_type,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      salary_currency: 'SAR',
      experience_min: parseInt(form.experience_min) || 0,
      status: 'active',
    };

    const { error: err } = editJob
      ? await supabase.from('jobs').update(payload).eq('id', editJob.id)
      : await supabase.from('jobs').insert(payload);

    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(`/${locale}/dashboard/employer`);
  }

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-2xl mx-auto" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-jobary-blue font-bold text-xl mb-2">
          <Briefcase className="h-6 w-6" /><span>Jobary</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.step} {step} {t.of} 3</p>
      </div>

      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-jobary-blue rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">{t.s1}</h2>
            <Input label={t.titleEn} value={form.title_en} required
              onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} placeholder="Sales Manager" dir="ltr" />
            <Input label={t.titleAr} value={form.title_ar}
              onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} placeholder="مدير مبيعات" dir="rtl" />
            <div className="grid grid-cols-2 gap-3">
              <Select label={t.sector} placeholder={t.selectSector} value={form.sector} required
                onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                options={sectors.map((s, i) => ({ value: SECTORS_EN[i], label: s }))} />
              <Select label={t.city} placeholder={t.selectCity} value={form.city} required
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                options={cities.map((c, i) => ({ value: CITIES_EN[i], label: c }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label={t.type} value={form.job_type}
                onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))}
                options={jobTypes.map((jt, i) => ({ value: JOB_TYPES_EN[i], label: jt }))} />
              <Select label={t.exp} value={form.experience_min}
                onChange={e => setForm(f => ({ ...f, experience_min: e.target.value }))}
                options={['0','1','2','3','4','5','7','10'].map(v => ({ value: v, label: `${v}+ ${rtl ? 'سنة' : 'yrs'}` }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.salMin} type="number" value={form.salary_min} dir="ltr"
                onChange={e => setForm(f => ({ ...f, salary_min: e.target.value }))} placeholder="3000" />
              <Input label={t.salMax} type="number" value={form.salary_max} dir="ltr"
                onChange={e => setForm(f => ({ ...f, salary_max: e.target.value }))} placeholder="8000" />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">{t.s2}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.descEn} <span className="text-red-500">*</span></label>
              <textarea rows={5} value={form.description_en} dir="ltr"
                onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.descAr}</label>
              <textarea rows={4} value={form.description_ar} dir="rtl"
                onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
                placeholder="اكتب وصف الوظيفة والمهام والمسؤوليات..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.reqEn}</label>
              <textarea rows={3} value={form.requirements_en} dir="ltr"
                onChange={e => setForm(f => ({ ...f, requirements_en: e.target.value }))}
                placeholder="- Bachelor's degree&#10;- 3+ years experience&#10;- Fluent in Arabic and English"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue resize-none" />
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">{t.s3}</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">{t.titleEn}:</span> <span className="font-medium">{form.title_en}</span></p>
              {form.title_ar && <p><span className="text-gray-500">{t.titleAr}:</span> <span className="font-medium">{form.title_ar}</span></p>}
              <p><span className="text-gray-500">{t.sector}:</span> <span className="font-medium">{form.sector}</span></p>
              <p><span className="text-gray-500">{t.city}:</span> <span className="font-medium">{form.city}</span></p>
              <p><span className="text-gray-500">{t.type}:</span> <span className="font-medium">{form.job_type}</span></p>
              {(form.salary_min || form.salary_max) && (
                <p><span className="text-gray-500">Salary:</span> <span className="font-medium">{form.salary_min} – {form.salary_max} SAR</span></p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-gray-700 mb-1">{t.descEn}</p>
              <p className="text-gray-600 line-clamp-4">{form.description_en}</p>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => (s - 1) as Step)} className="gap-1">
              <ChevronLeft className={cn('h-4 w-4', rtl && 'rotate-180')} />{t.back}
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={() => setStep(s => (s + 1) as Step)} className="gap-1">
              {t.next}<ChevronRight className={cn('h-4 w-4', rtl && 'rotate-180')} />
            </Button>
          ) : (
            <Button onClick={handlePublish} loading={loading} size="lg">{t.publish}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
