'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell({ locale }: { locale: string }) {
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Count unread messages
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null);
      setUnread(count || 0);

      // Subscribe to new messages
      const channel = supabase
        .channel('unread-msgs')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => setUnread(n => n + 1))
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
    init();
  }, []);

  if (!userId) return null;

  return (
    <a href={`/${locale}/messages`} className="relative p-1.5 text-gray-600 hover:text-jobary-blue transition-colors">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </a>
  );
}
