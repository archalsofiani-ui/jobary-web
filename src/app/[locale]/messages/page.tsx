import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { MessagesInbox } from '@/components/messaging/MessagesInbox';

export default function MessagesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <MessagesInbox locale={locale} />
    </Suspense>
  );
}
