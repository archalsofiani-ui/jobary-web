'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { JobCard } from './JobCard';
import { Spinner } from '@/components/ui';
import { searchJobs, toggleSaveJob, getSavedJobIds, SECTORS_EN, SECTORS_AR, CITIES_EN, CITIES_AR, JOB_TYPES_EN, JOB_TYPES_AR } from '@/lib/jobs';
import type { Job } from '@/lib/jobs';
import { cn } from '@/lib/utils';

export function JobSearch({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();
  const sp = useSearchParams();

  const [query, setQuery] = useState(sp.get('q') || '');
  const [sector, setSector] = useState(sp.get('sector') || '');
  const [city, setCity] = useState(sp.get('city') || '');
  const [jobType, setJobType] = useState(sp.get('type') || '');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const sectors = rtl ? SECTORS_AR : SECTORS_EN;
  const cities  = rtl ? CITIES_AR  : CITIES_EN;
  const types   = rtl ? JOB_TYPES_AR : JOB_TYPES_EN;

  const t = {
    search: rtl ? 'بحث عن وظائف' : 'Search Jobs',
    searchPlaceholder: rtl ? 'المسمى الوظيفي أو المهارة' : 'Job title or skill',
    locationPlaceholder: rtl ? 'المدينة' : 'City',
    filters: rtl ? 'فلاتر' : 'Filters',
    sector: rtl ? 'القطاع' : 'Sector',
    type: rtl ? 'نوع الوظيفة' : 'Job Type',
    allSectors: rtl ? 'كل القطاعات' : 'All Sectors',
    allTypes: rtl ? 'كل الأنواع' : 'All Types',
    allCities: rtl ? 'كل المدن' : 'All Cities',
    results: (n: number) => rtl ? `${n} وظيفة` : `${n} jobs`,
    noResults: rtl ? 'لا توجد وظائف مطابقة' : 'No matching jobs found',
    noResultsHint: rtl ? 'جرب تغيير كلمات البحث أو الفلاتر' : 'Try different keywords or filters',
    clearFilters: rtl ? 'مسح الفلاتر' : 'Clear Filters',
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await searchJobs({ query, sector, city, job_type: jobType, limit: 24 });
    if (!error && data) {
      setJobs(data as Job[]);
      setTotal(data.length);
    }
    setLoading(false);
  }, [query, sector, city, jobType]);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => { getSavedJobIds().then(setSavedIds); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadJobs();
  }

  async function handleSave(id: string) {
    await toggleSaveJob(id);
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const hasFilters = sector || city || jobType;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={rtl ? 'rtl' : 'ltr'}>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full text-sm text-gray-900 focus:outline-none bg-transparent"
          />
        </div>
        <div className="hidden sm:block w-px bg-gray-200 self-stretch" />
        <div className="flex-1 flex items-center gap-2 px-3">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full text-sm text-gray-700 focus:outline-none bg-transparent">
            <option value="">{t.allCities}</option>
            {cities.map((c, i) => <option key={i} value={CITIES_EN[i]}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowFilters(f => !f)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors',
              showFilters || hasFilters ? 'border-jobary-blue text-jobary-blue bg-jobary-light' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
            <SlidersHorizontal className="h-4 w-4" />
            {t.filters}
            {hasFilters && <span className="w-2 h-2 rounded-full bg-jobary-blue" />}
          </button>
          <Button type="submit" size="sm">{t.search}</Button>
        </div>
      </form>

      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex-1 min-w-[160px]">
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-jobary-blue">
              <option value="">{t.allSectors}</option>
              {sectors.map((s, i) => <option key={i} value={SECTORS_EN[i]}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <select value={jobType} onChange={e => setJobType(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-jobary-blue">
              <option value="">{t.allTypes}</option>
              {types.map((tp, i) => <option key={i} value={JOB_TYPES_EN[i]}>{tp}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={() => { setSector(''); setCity(''); setJobType(''); }}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2">
              <X className="h-4 w-4" />{t.clearFilters}
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">{t.results(total)}</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">{t.noResults}</p>
          <p className="text-sm mt-1">{t.noResultsHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} locale={locale}
              saved={savedIds.includes(job.id)} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
