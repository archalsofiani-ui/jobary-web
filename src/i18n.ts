import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  const messages = locale === 'ar'
    ? (await import('./messages/ar.json')).default
    : (await import('./messages/en.json')).default;

  return { messages };
});
