import { createClient } from '@/lib/supabase/client';

export async function signInWithPhone(phone: string) {
  const supabase = createClient();
  // Ensure +966 prefix
  const formatted = phone.startsWith('+') ? phone : `+966${phone.replace(/^0/, '')}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: formatted,
    options: { channel: 'sms' },
  });
  return { error, phone: formatted };
}

export async function verifyOtp(phone: string, token: string, role: 'seeker' | 'employer') {
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
    options: {
      data: { role, language_pref: 'ar' },
    },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
