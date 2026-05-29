const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-project.supabase.co', // replace with your Supabase project URL
    ],
  },
};

module.exports = withNextIntl(nextConfig);
