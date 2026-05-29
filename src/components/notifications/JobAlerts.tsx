'use client';

import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { SECTORS_EN, SECTORS_AR, CITIES_EN, CITIES_AR, JOB_TYPES_EN, JOB_TYPES_AR } from '@/lib/jobs';

export function JobAlerts({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sector: '', city: '', job_type: '', frequency: 'daily' });

  const sectors = rtl ? SECTORS_AR : SECTORS_EN;
  const cities  = rtl ? CITIES_AR  : CITIES_EN;
  const types   = rtl ? JOB_TYPES_AR : JOB_TYPES_EN;

  const t = {
    title: rtl ? 'تنبيهات الوظائف' : 'Job Alerts',
    subtitle: rtl ? 'أُعلَم فور نشر وظائف تناسبك' : 'Get notified when matching jobs are posted',
    add: rtl ? 'إضافة تنبيه' : 'Add Alert',
    sector: rtl ? 'القطاع' : 'Sector',
    city: rtl ? 'المدينة' : 'City',
    type: rtl ? 'نوع الوظيفة' : 'Job Type',
    freq: rtl ? 'تكرار الإشعار' : 'Frequency',
    save: rtl ? 'حفظ التنبيه' : 'Save Alert',
    cancel: rtl ? 'إلغاء' : 'Cancel',
    noAlerts: rtl ? 'لا توجد تنبيهات' : 'No alerts set',
    noAlertsHint: rtl ? 'أضف تنبيهاً ليصلك إشعار عند توفر وظائف مناسبة' : 'Add an alert to get notified about matching jobs',
    delete: rtl ? 'حذف' : 'Delete',
    all: rtl ? 'الكل' : 'All',
    freqs: {
      instant: rtl ? 'فوري' : 'Instant',
      daily: rtl ? 'يومي' : 'Daily',
      weekly: rtl ? 'أسبوعي' : 'Weekly',
    },
  };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('job_alerts').select('*').eq('seeker_id', user.id).order('created_at', { ascending: false });
      setAlerts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function saveAlert() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('job_alerts').insert({
      seeker_id: user.id,
      sector: form.sector || null,
      city: form.city || null,
      job_type: form.job_type || null,
      frequency: form.frequency,
      is_active: true,
    }).select().single();
    if (data) setAlerts(prev => [data, ...prev]);
    setShowForm(false);
    setForm({ sector: '', city: '', job_type: '', frequency: 'daily' });
    setSaving(false);
  }

  async function deleteAlert(id: string) {
    await createClient().from('job_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function toggleAlert(id: string, current: boolean) {
    await createClient().from('job_alerts').update({ is_active: !current }).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-jobary-blue" />{t.title}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-1" size="sm">
          <Plus className="h-4 w-4" />{t.add}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-jobary-blue border-2 p-5 mb-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label={t.sector} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
              placeholder={t.all} options={sectors.map((s, i) => ({ value: SECTORS_EN[i], label: s }))} />
            <Select label={t.city} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder={t.all} options={cities.map((c, i) => ({ value: CITIES_EN[i], label: c }))} />
            <Select label={t.type} value={form.job_type} onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))}
              placeholder={t.all} options={types.map((jt, i) => ({ value: JOB_TYPES_EN[i], label: jt }))} />
            <Select label={t.freq} value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
              options={[
                { value: 'instant', label: t.freqs.instant },
                { value: 'daily',   label: t.freqs.daily },
                { value: 'weekly',  label: t.freqs.weekly },
              ]} />
          </div>
          <div className="flex gap-2">
            <Button onClick={saveAlert} loading={saving} size="sm">{t.save}</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>{t.cancel}</Button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {!loading && alerts.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-gray-600 mb-1">{t.noAlerts}</p>
          <p className="text-sm">{t.noAlertsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${alert.is_active ? 'bg-green-400' : 'bg-gray-200'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {[alert.sector, alert.city, alert.job_type].filter(Boolean).join(' · ') || (rtl ? 'كل الوظائف' : 'All Jobs')}
                  </p>
                  <p className="text-xs text-gray-400">{alert.frequency}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${alert.is_active ? 'border-green-300 text-green-600 bg-green-50' : 'border-gray-200 text-gray-400'}`}>
                  {alert.is_active ? (rtl ? 'مفعّل' : 'Active') : (rtl ? 'موقوف' : 'Paused')}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
