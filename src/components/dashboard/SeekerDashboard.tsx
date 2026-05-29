'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Search, FileText, BookmarkCheck, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function SeekerDashboard({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push(`/${locale}/login`); return; }
      const { data } = await supabase.from('seeker_profiles').select('*').eq('user_id', user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const t = {
    welcome: rtl ? 'مرحباً' : 'Welcome back',
    searchJobs: rtl ? 'بحث عن وظائف' : 'Search Jobs',
    myApps: rtl ? 'طلباتي' : 'My Applications',
    saved: rtl ? 'الوظائف المحفوظة' : 'Saved Jobs',
    profile: rtl ? 'ملفي الشخصي' : 'My Profile',
    logout: rtl ? 'تسجيل الخروج' : 'Log out',
    noApps: rtl ? 'لم تقدم على أي وظيفة بعد' : "You haven't applied to any jobs yet",
    browseJobs: rtl ? 'تصفح الوظائف' : 'Browse Jobs',
    edit: rtl ? 'تعديل' : 'Edit',
  };

  async function handleLogout() {
    await signOut();
    router.push(`/${locale}`);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-jobary-blue border-t-transparent rounded-full" />
    </div>
  );

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
              {t.welcome}, {profile?.name_en || profile?.name_ar || ''}
            </span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Search, label: t.searchJobs, href: `/${locale}/jobs`, color: 'bg-blue-50 text-blue-600' },
            { icon: FileText, label: t.myApps, href: `/${locale}/dashboard/seeker/applications`, color: 'bg-green-50 text-green-600' },
            { icon: BookmarkCheck, label: t.saved, href: `/${locale}/dashboard/seeker/saved`, color: 'bg-yellow-50 text-yellow-600' },
            { icon: User, label: t.profile, href: `/${locale}/dashboard/seeker/profile`, color: 'bg-purple-50 text-purple-600' },
          ].map(({ icon: Icon, label, href, color }) => (
            <Link key={label} href={href}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all text-center">
              <div className={`p-2.5 rounded-full ${color}`}><Icon className="h-5 w-5" /></div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>

        {/* Profile card */}
        {profile && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">{t.profile}</h2>
              <Link href={`/${locale}/dashboard/seeker/profile`} className="text-xs text-jobary-blue hover:underline">{t.edit}</Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-jobary-light rounded-full flex items-center justify-center text-jobary-blue font-bold text-lg">
                {(profile.name_en || profile.name_ar || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile.name_en || profile.name_ar}</p>
                <p className="text-sm text-gray-500">{profile.city} · {profile.nationality}</p>
              </div>
            </div>
          </div>
        )}

        {/* Applications placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">{t.myApps}</h2>
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{t.noApps}</p>
            <Link href={`/${locale}/jobs`}>
              <Button variant="outline" size="sm" className="mt-3">{t.browseJobs}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
