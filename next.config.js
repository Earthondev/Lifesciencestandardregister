/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['chart.googleapis.com', 'docs.google.com'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Life Science Standards Register',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
