'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, User, Phone, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { signInWithPhone, verifyOtp } from '@/lib/auth';
import { cn } from '@/lib/utils';

type Step = 'role' | 'phone' | 'otp';
type Role = 'seeker' | 'employer';

const isRtl = (locale: string) => locale === 'ar';

const copy = {
  en: {
    title: 'Create your account',
    roleTitle: "I'm joining as a...",
    seeker: 'Job Seeker',
    seekerDesc: 'Find jobs, upload your CV, apply with one tap',
    employer: 'Employer',
    employerDesc: 'Post jobs, find talent, manage applicants',
    phoneTitle: 'Enter your Saudi mobile number',
    phoneHint: 'We\'ll send you a verification code via SMS',
    phonePlaceholder: '05X XXX XXXX',
    sendCode: 'Send Verification Code',
    otpTitle: 'Enter the code',
    otpHint: (phone: string) => `We sent a 6-digit code to ${phone}`,
    otpPlaceholder: '_ _ _ _ _ _',
    verify: 'Verify & Continue',
    resend: 'Resend code',
    back: 'Back',
    haveAccount: 'Already have an account?',
    login: 'Log in',
    sending: 'Sending...',
    verifying: 'Verifying...',
  },
  ar: {
    title: 'إنشاء حساب جديد',
    roleTitle: 'أنضم كـ...',
    seeker: 'باحث عن عمل',
    seekerDesc: 'ابحث عن وظائف، ارفع سيرتك الذاتية، قدم بنقرة واحدة',
    employer: 'صاحب عمل',
    employerDesc: 'انشر وظائف، ابحث عن المواهب، إدر المتقدمين',
    phoneTitle: 'أدخل رقم جوالك السعودي',
    phoneHint: 'سنرسل لك رمز التحقق عبر الرسائل القصيرة',
    phonePlaceholder: '05X XXX XXXX',
    sendCode: 'إرسال رمز التحقق',
    otpTitle: 'أدخل الرمز',
    otpHint: (phone: string) => `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${phone}`,
    otpPlaceholder: '_ _ _ _ _ _',
    verify: 'تحقق واستمر',
    resend: 'إعادة إرسال الرمز',
    back: 'رجوع',
    haveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    sending: 'جاري الإرسال...',
    verifying: 'جاري التحقق...',
  },
};

export function SignupFlow({ locale }: { locale: string }) {
  const t = copy[locale as keyof typeof copy] || copy.en;
  const rtl = isRtl(locale);
  const router = useRouter();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp() {
    setError('');
    if (!phone || phone.length < 9) {
      setError('Please enter a valid Saudi mobile number');
      return;
    }
    setLoading(true);
    const { error: err, phone: formatted } = await signInWithPhone(phone);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setFormattedPhone(formatted);
    setStep('otp');
  }

  async function handleVerifyOtp() {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    const { data, error: err } = await verifyOtp(formattedPhone, otp, role!);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Redirect to onboarding
    router.push(`/${locale}/onboarding/${role}`);
  }

  return (
    <div className="w-full max-w-md" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-jobary-blue font-bold text-2xl">
          <Briefcase className="h-7 w-7" />
          <span>Jobary</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{t.title}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        {/* ── STEP 1: ROLE SELECTION ── */}
        {step === 'role' && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 mb-4">{t.roleTitle}</p>
            {[
              { key: 'seeker' as Role, label: t.seeker, desc: t.seekerDesc, icon: User },
              { key: 'employer' as Role, label: t.employer, desc: t.employerDesc, icon: Briefcase },
            ].map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setRole(key); setStep('phone'); }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-start transition-all',
                  'hover:border-jobary-blue hover:bg-jobary-light',
                  role === key ? 'border-jobary-blue bg-jobary-light' : 'border-gray-200'
                )}
              >
                <div className="bg-jobary-blue rounded-full p-2.5 shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <ChevronRight className={cn("h-4 w-4 text-gray-400 shrink-0", rtl && "rotate-180")} />
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 2: PHONE NUMBER ── */}
        {step === 'phone' && (
          <div className="space-y-5">
            <button onClick={() => setStep('role')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className={cn("h-4 w-4", rtl && "rotate-180")} />
              {t.back}
            </button>
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t.phoneTitle}</p>
              <p className="text-sm text-gray-500">{t.phoneHint}</p>
            </div>
            {/* Saudi phone input */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2.5 shrink-0">
                <span className="text-lg">🇸🇦</span>
                <span className="text-sm font-medium text-gray-700">+966</span>
              </div>
              <input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue"
                autoFocus
                dir="ltr"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button fullWidth onClick={handleSendOtp} loading={loading}>
              {loading ? t.sending : t.sendCode}
            </Button>
          </div>
        )}

        {/* ── STEP 3: OTP ── */}
        {step === 'otp' && (
          <div className="space-y-5">
            <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className={cn("h-4 w-4", rtl && "rotate-180")} />
              {t.back}
            </button>
            <div>
              <p className="font-semibold text-gray-900 mb-1">{t.otpTitle}</p>
              <p className="text-sm text-gray-500">{t.otpHint(formattedPhone)}</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder={t.otpPlaceholder}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-jobary-blue"
              autoFocus
              dir="ltr"
              maxLength={6}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button fullWidth onClick={handleVerifyOtp} loading={loading}>
              {loading ? t.verifying : t.verify}
            </Button>
            <button onClick={handleSendOtp} className="w-full text-sm text-jobary-blue hover:underline text-center">
              {t.resend}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
          {t.haveAccount}{' '}
          <Link href={`/${locale}/login`} className="text-jobary-blue font-medium hover:underline">{t.login}</Link>
        </div>
      </div>
    </div>
  );
}
