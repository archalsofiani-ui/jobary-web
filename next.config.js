/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['rxzbtatmbvnpnunppahu.supabase.co'],
  },
};

const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');
module.exports = withNextIntl(nextConfig);
