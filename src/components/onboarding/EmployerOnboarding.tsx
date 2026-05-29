'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const SECTORS_EN = ['Sales','Marketing','Customer Service','Administration','Technology','Engineering','Healthcare','Education','Hospitality','Construction','Logistics','Finance','Retail','Real Estate','Food & Beverage'];
const SECTORS_AR = ['المبيعات','التسويق','خدمة العملاء','الإدارة','التقنية','الهندسة','الرعاية الصحية','التعليم','الضيافة','البناء','اللوجستيات','المالية','التجزئة','العقارات','الأغذية والمشروبات'];
const CITIES_EN = ['Riyadh','Jeddah','Makkah','Madinah','Dammam','Khobar','Abha','Tabuk','Qassim'];
const CITIES_AR = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','أبها','تبوك','القصيم'];
const SIZES = ['1-10','11-50','51-200','201-500','500+'];

export function EmployerOnboarding({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name_en: '', name_ar: '',
    sector: '', city: '', size: '',
    cr_number: '',
    description_en: '', description_ar: '',
  });

  const cities = rtl ? CITIES_AR : CITIES_EN;
  const sectors = rtl ? SECTORS_AR : SECTORS_EN;

  const t = {
    title: rtl ? 'إعداد شركتك' : 'Set up your company',
    subtitle: rtl ? 'أخبرنا عن شركتك لنعرض ملفها للباحثين عن عمل' : 'Tell us about your company so job seekers can find you',
    nameEn: 'Company Name (English)',
    nameAr: 'اسم الشركة (عربي)',
    sector: rtl ? 'القطاع' : 'Sector',
    city: rtl ? 'المدينة' : 'City',
    size: rtl ? 'حجم الشركة' : 'Company Size',
    crNumber: rtl ? 'رقم السجل التجاري (اختياري)' : 'Commercial Registration No. (optional)',
    descEn: 'Description (English)',
    descAr: 'وصف الشركة (عربي)',
    submit: rtl ? 'إنشاء الحساب والبدء' : 'Create Account & Start',
    selectSector: rtl ? 'اختر القطاع' : 'Select sector',
    selectCity: rtl ? 'اختر المدينة' : 'Select city',
    selectSize: rtl ? 'اختر حجم الشركة' : 'Select size',
  };

  async function handleSubmit() {
    setError('');
    if (!form.name_en) { setError(rtl ? 'اسم الشركة مطلوب' : 'Company name is required'); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    const { error: err } = await supabase.from('companies').upsert({
      owner_id: user.id,
      name_en: form.name_en,
      name_ar: form.name_ar,
      sector: form.sector,
      city: form.city,
      size: form.size,
      cr_number: form.cr_number,
      description_en: form.description_en,
      description_ar: form.description_ar,
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(`/${locale}/dashboard/employer`);
  }

  return (
    <div className="max-w-lg mx-auto" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-jobary-blue font-bold text-xl mb-2">
          <Briefcase className="h-6 w-6" /><span>Jobary</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <Input label={t.nameEn} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} placeholder="ACME Company" dir="ltr" required />
        <Input label={t.nameAr} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="شركة أكمي" dir="rtl" />
        <div className="grid grid-cols-2 gap-3">
          <Select label={t.sector} placeholder={t.selectSector} value={form.sector}
            onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
            options={sectors.map((s, i) => ({ value: SECTORS_EN[i], label: s }))} />
          <Select label={t.city} placeholder={t.selectCity} value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            options={cities.map((c, i) => ({ value: CITIES_EN[i], label: c }))} />
        </div>
        <Select label={t.size} placeholder={t.selectSize} value={form.size}
          onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
          options={SIZES.map(s => ({ value: s, label: s }))} />
        <Input label={t.crNumber} value={form.cr_number} onChange={e => setForm(f => ({ ...f, cr_number: e.target.value }))} placeholder="1234567890" dir="ltr" />

        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button fullWidth onClick={handleSubmit} loading={loading} size="lg">{t.submit}</Button>
      </div>
    </div>
  );
}
