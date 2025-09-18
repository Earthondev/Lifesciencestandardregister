/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    domains: ['chart.googleapis.com', 'docs.google.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Life Science Standards Register',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
