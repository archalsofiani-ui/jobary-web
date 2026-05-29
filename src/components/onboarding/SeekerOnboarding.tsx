'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Upload, X, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const CITIES_AR = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','أبها','تبوك','القصيم','حائل','جيزان','نجران'];
const CITIES_EN = ['Riyadh','Jeddah','Makkah','Madinah','Dammam','Khobar','Abha','Tabuk','Qassim','Hail','Jizan','Najran'];
const SECTORS_AR = ['المبيعات','التسويق','خدمة العملاء','الإدارة','التقنية','الهندسة','الرعاية الصحية','التعليم','الضيافة','البناء','اللوجستيات','المالية'];
const SECTORS_EN = ['Sales','Marketing','Customer Service','Administration','Technology','Engineering','Healthcare','Education','Hospitality','Construction','Logistics','Finance'];
const NATIONALITIES_AR = ['سعودي','مصري','سوداني','يمني','سوري','لبناني','باكستاني','هندي','فلبيني','أخرى'];
const NATIONALITIES_EN = ['Saudi','Egyptian','Sudanese','Yemeni','Syrian','Lebanese','Pakistani','Indian','Filipino','Other'];
const SKILLS_LIST = ['Microsoft Office','Excel','Communication','Sales','Customer Service','Driving','Cooking','Security','Cleaning','Logistics','Arabic Typing','English Typing','Social Media','Accounting','Project Management'];
const LANGUAGES_LIST = ['Arabic','English','Urdu','Hindi','Filipino','French'];

type Step = 1 | 2 | 3 | 4;

export function SeekerOnboarding({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name_en: '', name_ar: '',
    nationality: '',
    city: '',
    sector: '',
    years_exp: '0',
    salary_min: '',
    salary_max: '',
    skills: [] as string[],
    languages: [] as string[],
    cv_url: '',
  });

  const cities = rtl ? CITIES_AR : CITIES_EN;
  const sectors = rtl ? SECTORS_AR : SECTORS_EN;
  const nationalities = rtl ? NATIONALITIES_AR : NATIONALITIES_EN;

  const t = {
    title: rtl ? 'أكمل ملفك الشخصي' : 'Complete your profile',
    step: rtl ? 'خطوة' : 'Step',
    of: rtl ? 'من' : 'of',
    next: rtl ? 'التالي' : 'Next',
    back: rtl ? 'رجوع' : 'Back',
    finish: rtl ? 'إنهاء وابدأ البحث' : 'Finish & Start Searching',
    // Step 1
    s1title: rtl ? 'معلوماتك الأساسية' : 'Your basic info',
    nameEn: 'Full Name (English)',
    nameAr: 'الاسم الكامل (عربي)',
    nationality: rtl ? 'الجنسية' : 'Nationality',
    city: rtl ? 'المدينة' : 'City',
    selectCity: rtl ? 'اختر المدينة' : 'Select city',
    selectNationality: rtl ? 'اختر الجنسية' : 'Select nationality',
    // Step 2
    s2title: rtl ? 'معلومات العمل' : 'Work information',
    sector: rtl ? 'القطاع المفضل' : 'Preferred sector',
    selectSector: rtl ? 'اختر القطاع' : 'Select sector',
    yearsExp: rtl ? 'سنوات الخبرة' : 'Years of experience',
    salaryMin: rtl ? 'الراتب المتوقع (الحد الأدنى) ريال' : 'Expected salary min (SAR)',
    salaryMax: rtl ? 'الراتب المتوقع (الحد الأقصى) ريال' : 'Expected salary max (SAR)',
    // Step 3
    s3title: rtl ? 'مهاراتك ولغاتك' : 'Your skills & languages',
    skillsLabel: rtl ? 'المهارات' : 'Skills',
    languagesLabel: rtl ? 'اللغات' : 'Languages',
    // Step 4
    s4title: rtl ? 'رفع السيرة الذاتية' : 'Upload your CV',
    s4desc: rtl ? 'ارفع سيرتك الذاتية بصيغة PDF (اختياري)' : 'Upload your CV in PDF format (optional)',
    uploadBtn: rtl ? 'اختر ملف PDF' : 'Choose PDF File',
    skipCv: rtl ? 'تخطي - سأرفعها لاحقاً' : 'Skip — upload later',
  };

  function toggleSkill(s: string) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s],
    }));
  }
  function toggleLanguage(l: string) {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(l) ? f.languages.filter(x => x !== l) : [...f.languages, l],
    }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    let cv_url = '';
    if (cvFile) {
      const path = `cvs/${user.id}/${cvFile.name}`;
      const { error: uploadErr } = await supabase.storage.from('cvs').upload(path, cvFile, { upsert: true });
      if (!uploadErr) cv_url = path;
    }

    const { error: profileErr } = await supabase.from('seeker_profiles').upsert({
      user_id: user.id,
      name_en: form.name_en,
      name_ar: form.name_ar,
      nationality: form.nationality,
      city: form.city,
      skills: form.skills,
      languages: form.languages,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      years_exp: parseInt(form.years_exp),
      cv_url,
    });

    if (profileErr) { setError(profileErr.message); setLoading(false); return; }
    router.push(`/${locale}/dashboard/seeker`);
  }

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-lg mx-auto" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-jobary-blue font-bold text-xl mb-2">
          <Briefcase className="h-6 w-6" /><span>Jobary</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.step} {step} {t.of} 4</p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-jobary-blue rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        {/* ── STEP 1: BASIC INFO ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">{t.s1title}</h2>
            <Input label={t.nameEn} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} placeholder="Mohammed Al-Shammari" dir="ltr" />
            <Input label={t.nameAr} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="محمد الشمري" dir="rtl" />
            <Select label={t.nationality} placeholder={t.selectNationality} value={form.nationality}
              onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              options={nationalities.map((n, i) => ({ value: NATIONALITIES_EN[i], label: n }))} />
            <Select label={t.city} placeholder={t.selectCity} value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              options={cities.map((c, i) => ({ value: CITIES_EN[i], label: c }))} />
          </div>
        )}

        {/* ── STEP 2: WORK INFO ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 mb-4">{t.s2title}</h2>
            <Select label={t.sector} placeholder={t.selectSector} value={form.sector}
              onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
              options={sectors.map((s, i) => ({ value: SECTORS_EN[i], label: s }))} />
            <Select label={t.yearsExp} value={form.years_exp}
              onChange={e => setForm(f => ({ ...f, years_exp: e.target.value }))}
              options={['0','1','2','3','4','5','6','7','8','9','10+'].map(v => ({ value: v, label: `${v} ${rtl ? 'سنة' : 'years'}` }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.salaryMin} type="number" value={form.salary_min} onChange={e => setForm(f => ({ ...f, salary_min: e.target.value }))} placeholder="3000" dir="ltr" />
              <Input label={t.salaryMax} type="number" value={form.salary_max} onChange={e => setForm(f => ({ ...f, salary_max: e.target.value }))} placeholder="8000" dir="ltr" />
            </div>
          </div>
        )}

        {/* ── STEP 3: SKILLS & LANGUAGES ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900">{t.s3title}</h2>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.skillsLabel}</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.skills.includes(s) ? 'bg-jobary-blue text-white border-jobary-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-jobary-blue')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.languagesLabel}</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_LIST.map(l => (
                  <button key={l} onClick={() => toggleLanguage(l)}
                    className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.languages.includes(l) ? 'bg-jobary-blue text-white border-jobary-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-jobary-blue')}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: CV UPLOAD ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900">{t.s4title}</h2>
            <p className="text-sm text-gray-500">{t.s4desc}</p>

            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => setCvFile(e.target.files?.[0] || null)} />

            {cvFile ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{cvFile.name}</p>
                  <p className="text-xs text-green-600">{(cvFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button onClick={() => setCvFile(null)} className="text-green-600 hover:text-green-800">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-jobary-blue hover:bg-jobary-light transition-all">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{t.uploadBtn}</p>
                <p className="text-xs text-gray-400 mt-1">PDF, max 5MB</p>
              </button>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => (s - 1) as Step)} className="gap-1">
              <ChevronLeft className={cn("h-4 w-4", rtl && "rotate-180")} />{t.back}
            </Button>
          )}
          <div className="flex-1" />
          {step < 4 ? (
            <Button onClick={() => setStep(s => (s + 1) as Step)} className="gap-1">
              {t.next}<ChevronRight className={cn("h-4 w-4", rtl && "rotate-180")} />
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={handleSubmit} loading={loading} size="sm">{t.skipCv}</Button>
              <Button onClick={handleSubmit} loading={loading}>{t.finish}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
