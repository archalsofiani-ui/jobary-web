'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { signInWithPhone, verifyOtp } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const copy = {
  en: {
    title: 'Welcome back',
    phoneTitle: 'Enter your mobile number',
    phonePlaceholder: '05X XXX XXXX',
    sendCode: 'Send Code',
    otpTitle: 'Enter the code',
    verify: 'Log In',
    back: 'Back',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    sending: 'Sending...', verifying: 'Verifying...',
  },
  ar: {
    title: 'مرحباً بعودتك',
    phoneTitle: 'أدخل رقم جوالك',
    phonePlaceholder: '05X XXX XXXX',
    sendCode: 'إرسال الرمز',
    otpTitle: 'أدخل الرمز',
    verify: 'تسجيل الدخول',
    back: 'رجوع',
    noAccount: 'ليس لديك حساب؟',
    signup: 'إنشاء حساب',
    sending: 'جاري الإرسال...', verifying: 'جاري التحقق...',
  },
};

export function LoginFlow({ locale }: { locale: string }) {
  const t = copy[locale as keyof typeof copy] || copy.en;
  const rtl = locale === 'ar';
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    setError('');
    setLoading(true);
    const { error: err, phone: formatted } = await signInWithPhone(phone);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setFormattedPhone(formatted);
    setStep('otp');
  }

  async function handleVerify() {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: formattedPhone, token: otp, type: 'sms',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    // Get user role and redirect
    const { data: userData } = await supabase
      .from('users').select('role').eq('id', data.user!.id).single();
    const role = userData?.role || 'seeker';
    router.push(`/${locale}/dashboard/${role}`);
  }

  return (
    <div className="w-full max-w-md" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="text-center mb-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-jobary-blue font-bold text-2xl">
          <Briefcase className="h-7 w-7" /><span>Jobary</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{t.title}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        {step === 'phone' ? (
          <>
            <p className="font-semibold text-gray-900">{t.phoneTitle}</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 shrink-0">
                <span className="text-lg">🇸🇦</span>
                <span className="text-sm font-medium text-gray-700">+966</span>
              </div>
              <input type="tel" placeholder={t.phonePlaceholder} value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue"
                autoFocus dir="ltr" />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button fullWidth onClick={handleSend} loading={loading}>{loading ? t.sending : t.sendCode}</Button>
          </>
        ) : (
          <>
            <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm text-gray-500">
              <ArrowLeft className={cn("h-4 w-4", rtl && "rotate-180")} />{t.back}
            </button>
            <p className="font-semibold text-gray-900">{t.otpTitle}</p>
            <input type="text" inputMode="numeric" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-jobary-blue"
              autoFocus dir="ltr" maxLength={6} />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button fullWidth onClick={handleVerify} loading={loading}>{loading ? t.verifying : t.verify}</Button>
          </>
        )}

        <div className="pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
          {t.noAccount}{' '}
          <Link href={`/${locale}/signup`} className="text-jobary-blue font-medium hover:underline">{t.signup}</Link>
        </div>
      </div>
    </div>
  );
}
