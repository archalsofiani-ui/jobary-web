'use client';

import Link from 'next/link';
import { MapPin, Clock, Banknote, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Job } from '@/lib/jobs';

const TYPE_COLORS: Record<string, 'blue' | 'green' | 'yellow' | 'gray'> = {
  'full-time': 'blue', 'part-time': 'yellow', 'contract': 'green', 'freelance': 'gray',
};
const TYPE_AR: Record<string, string> = {
  'full-time': 'دوام كامل', 'part-time': 'دوام جزئي', 'contract': 'عقد', 'freelance': 'عمل حر',
};

interface JobCardProps {
  job: Job;
  locale: string;
  saved?: boolean;
  onSave?: (id: string) => void;
}

export function JobCard({ job, locale, saved = false, onSave }: JobCardProps) {
  const rtl = locale === 'ar';
  const title = rtl && job.title_ar ? job.title_ar : job.title_en;
  const company = rtl && job.companies?.name_ar ? job.companies.name_ar : job.companies?.name_en;
  const jobTypeLabel = rtl ? TYPE_AR[job.job_type] : job.job_type.replace('-', ' ');

  const salary = job.salary_min && job.salary_max
    ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
    : job.salary_min
    ? `${job.salary_min.toLocaleString()}+ ${job.salary_currency}`
    : null;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group relative"
    >
      {/* Save button */}
      {onSave && (
        <button
          onClick={e => { e.preventDefault(); onSave(job.id); }}
          className={cn(
            'absolute top-3 end-3 p-1.5 rounded-full transition-colors',
            saved ? 'text-jobary-blue' : 'text-gray-300 hover:text-jobary-blue'
          )}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      )}

      <Link href={`/${locale}/jobs/${job.id}`} className="block">
        {/* Company */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-jobary-light rounded-lg flex items-center justify-center text-jobary-blue font-bold text-sm shrink-0">
            {(company || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{company}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-jobary-blue transition-colors leading-snug pe-6">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.city}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{jobTypeLabel}</span>
          {salary && <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />{salary}</span>}
        </div>

        {/* Badge */}
        <Badge variant={TYPE_COLORS[job.job_type] || 'gray'} className="text-xs">
          {jobTypeLabel}
        </Badge>
      </Link>
    </div>
  );
}
