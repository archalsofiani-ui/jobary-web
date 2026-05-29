'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Thread = {
  otherId: string;
  otherName: string;
  jobTitle?: string;
  jobId?: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export function MessagesInbox({ locale }: { locale: string }) {
  const rtl = locale === 'ar';
  const sp = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const t = {
    inbox: rtl ? 'الرسائل' : 'Messages',
    typeMsg: rtl ? 'اكتب رسالة...' : 'Type a message...',
    send: rtl ? 'إرسال' : 'Send',
    empty: rtl ? 'لا توجد رسائل بعد' : 'No messages yet',
    emptyHint: rtl ? 'ستظهر محادثاتك هنا' : 'Your conversations will appear here',
    back: rtl ? 'رجوع' : 'Back',
  };

  const loadThreads = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: msgs } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id), receiver:receiver_id(id), jobs(title_en, title_ar)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!msgs) { setLoading(false); return; }

    // Build threads grouped by conversation partner
    const threadMap = new Map<string, Thread>();
    for (const m of msgs) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${otherId}-${m.job_id || 'none'}`;
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          otherId,
          otherName: `User ${otherId.slice(0, 6)}`,
          jobTitle: rtl && m.jobs?.title_ar ? m.jobs.title_ar : m.jobs?.title_en,
          jobId: m.job_id,
          lastMessage: m.content,
          lastAt: m.created_at,
          unread: (!m.read_at && m.receiver_id === user.id) ? 1 : 0,
        });
      } else {
        const t = threadMap.get(key)!;
        if (!m.read_at && m.receiver_id === user.id) t.unread++;
      }
    }

    // Fetch other user names from seeker_profiles + companies
    const threadList = Array.from(threadMap.values());
    const otherIds = [...new Set(threadList.map(t => t.otherId))];

    const [{ data: seekers }, { data: companies }] = await Promise.all([
      supabase.from('seeker_profiles').select('user_id, name_en, name_ar').in('user_id', otherIds),
      supabase.from('companies').select('owner_id, name_en, name_ar').in('owner_id', otherIds),
    ]);

    for (const thread of threadList) {
      const seeker = seekers?.find(s => s.user_id === thread.otherId);
      const company = companies?.find(c => c.owner_id === thread.otherId);
      if (seeker) thread.otherName = rtl && seeker.name_ar ? seeker.name_ar : seeker.name_en || thread.otherName;
      else if (company) thread.otherName = rtl && company.name_ar ? company.name_ar : company.name_en || thread.otherName;
    }

    setThreads(threadList);
    setLoading(false);

    // Auto-open from URL param
    const withUser = sp.get('with');
    const forJob = sp.get('job');
    if (withUser) {
      const found = threadList.find(t => t.otherId === withUser && (!forJob || t.jobId === forJob));
      if (found) openThread(found, user.id);
      else {
        // New conversation
        const key = `${withUser}-${forJob || 'none'}`;
        openThread({ otherId: withUser, otherName: withUser.slice(0, 6), jobId: forJob || undefined, lastMessage: '', lastAt: '', unread: 0 }, user.id);
      }
    }
  }, [sp, rtl]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  async function openThread(thread: Thread, uid?: string) {
    setActiveThread(thread);
    const myId = uid || userId;
    if (!myId) return;

    const supabase = createClient();
    const query = supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${thread.otherId}),and(sender_id.eq.${thread.otherId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true });

    if (thread.jobId) query.eq('job_id', thread.jobId);

    const { data } = await query;
    setMessages(data || []);

    // Mark as read
    await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', myId)
      .eq('sender_id', thread.otherId)
      .is('read_at', null);

    setThreads(prev => prev.map(t =>
      t.otherId === thread.otherId && t.jobId === thread.jobId ? { ...t, unread: 0 } : t
    ));

    // Subscribe real-time
    const supabase2 = createClient();
    supabase2.channel(`chat-${thread.otherId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const m = payload.new as Message;
        if ((m.sender_id === thread.otherId && m.receiver_id === myId) ||
            (m.sender_id === myId && m.receiver_id === thread.otherId)) {
          setMessages(prev => [...prev, m]);
        }
      })
      .subscribe();
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!newMsg.trim() || !activeThread || !userId) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: activeThread.otherId,
      job_id: activeThread.jobId || null,
      content: newMsg.trim(),
    });
    setNewMsg('');
    setSending(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="h-[calc(100vh-4rem)] flex" dir={rtl ? 'rtl' : 'ltr'}>

      {/* Thread list */}
      <div className={cn(
        'w-full md:w-80 border-e border-gray-200 bg-white flex flex-col shrink-0',
        activeThread && 'hidden md:flex'
      )}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-gray-900">{t.inbox}</h1>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Spinner /></div>
        ) : threads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <p className="font-medium text-gray-600 mb-1">{t.empty}</p>
            <p className="text-sm">{t.emptyHint}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {threads.map((thread, i) => (
              <button key={i} onClick={() => openThread(thread)}
                className={cn(
                  'w-full text-start px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  activeThread?.otherId === thread.otherId && activeThread?.jobId === thread.jobId && 'bg-jobary-light'
                )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-jobary-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {thread.otherName[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{thread.otherName}</p>
                      {thread.jobTitle && <p className="text-xs text-jobary-blue truncate">{thread.jobTitle}</p>}
                      <p className="text-xs text-gray-400 truncate">{thread.lastMessage}</p>
                    </div>
                  </div>
                  {thread.unread > 0 && (
                    <span className="w-5 h-5 bg-jobary-blue text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat window */}
      {activeThread ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button className="md:hidden text-gray-500" onClick={() => setActiveThread(null)}>
              <ArrowLeft className={cn('h-5 w-5', rtl && 'rotate-180')} />
            </button>
            <div className="w-9 h-9 rounded-full bg-jobary-blue text-white flex items-center justify-center font-bold text-sm">
              {activeThread.otherName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{activeThread.otherName}</p>
              {activeThread.jobTitle && <p className="text-xs text-jobary-blue">{activeThread.jobTitle}</p>}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => {
              const isMine = msg.sender_id === userId;
              return (
                <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm',
                    isMine
                      ? 'bg-jobary-blue text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn('text-[10px] mt-1', isMine ? 'text-blue-200' : 'text-gray-400')}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-3 flex items-end gap-2">
            <textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.typeMsg}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jobary-blue max-h-32"
              style={{ height: 'auto', minHeight: '42px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim() || sending}
              className="p-2.5 bg-jobary-blue text-white rounded-xl hover:bg-blue-800 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className={cn('h-4 w-4', rtl && 'rotate-180')} />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-gray-400">
          <div className="text-center">
            <Send className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{rtl ? 'اختر محادثة للبدء' : 'Select a conversation to start'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
