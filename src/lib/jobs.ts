import { createClient } from '@/lib/supabase/client';

export const JOB_TYPES_EN = ['full-time', 'part-time', 'contract', 'freelance'];
export const JOB_TYPES_AR = ['دوام كامل', 'دوام جزئي', 'عقد', 'عمل حر'];

export const SECTORS_EN = ['Sales','Marketing','Customer Service','Administration','Technology','Engineering','Healthcare','Education','Hospitality','Construction','Logistics','Finance','Retail','Real Estate','Food & Beverage'];
export const SECTORS_AR = ['المبيعات','التسويق','خدمة العملاء','الإدارة','التقنية','الهندسة','الرعاية الصحية','التعليم','الضيافة','البناء','اللوجستيات','المالية','التجزئة','العقارات','الأغذية والمشروبات'];

export const CITIES_EN = ['Riyadh','Jeddah','Makkah','Madinah','Dammam','Khobar','Abha','Tabuk','Qassim','Hail','Jizan','Najran','Remote'];
export const CITIES_AR = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','أبها','تبوك','القصيم','حائل','جيزان','نجران','عن بُعد'];

export type Job = {
  id: string;
  company_id: string;
  title_en: string;
  title_ar?: string;
  description_en: string;
  description_ar?: string;
  requirements_en?: string;
  sector: string;
  city: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  experience_min: number;
  status: string;
  created_at: string;
  companies?: { name_en: string; name_ar?: string; logo_url?: string; city?: string };
};

export async function searchJobs(params: {
  query?: string;
  sector?: string;
  city?: string;
  job_type?: string;
  salary_min?: number;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let q = supabase
    .from('jobs')
    .select('*, companies(name_en, name_ar, logo_url, city)')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(params.limit || 20)
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

  if (params.sector)   q = q.eq('sector', params.sector);
  if (params.city)     q = q.eq('city', params.city);
  if (params.job_type) q = q.eq('job_type', params.job_type);
  if (params.salary_min) q = q.gte('salary_min', params.salary_min);
  if (params.query)    q = q.textSearch('title_en', params.query, { type: 'websearch' });

  return q;
}

export async function getJob(id: string) {
  const supabase = createClient();
  return supabase
    .from('jobs')
    .select('*, companies(name_en, name_ar, logo_url, city, description_en, description_ar, size, sector)')
    .eq('id', id)
    .single();
}

export async function applyToJob(jobId: string, coverNote?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { message: 'Not authenticated' } };

  // Increment view count
  await supabase.rpc('increment_applications', { job_id: jobId }).catch(() => {});

  return supabase.from('applications').insert({
    job_id: jobId,
    seeker_id: user.id,
    cover_note: coverNote,
    status: 'submitted',
  });
}

export async function toggleSaveJob(jobId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('saved_jobs').select('job_id').eq('seeker_id', user.id).eq('job_id', jobId).single();

  if (data) {
    return supabase.from('saved_jobs').delete().eq('seeker_id', user.id).eq('job_id', jobId);
  } else {
    return supabase.from('saved_jobs').insert({ seeker_id: user.id, job_id: jobId });
  }
}

export async function getSavedJobIds(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('saved_jobs').select('job_id').eq('seeker_id', user.id);
  return data?.map(d => d.job_id) || [];
}
