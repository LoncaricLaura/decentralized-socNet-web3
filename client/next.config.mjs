/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const domains = (process.env.NEXT_PUBLIC_IMAGE_DOMAINS || '')
  .split(',')
  .map(domain => domain.trim())
  .filter(Boolean);

const nextConfig = {
  images: {
      domains: domains,
  },
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'text-encoding': require.resolve('text-encoding'),
      };
    }
    config.module.exprContextCritical = false;
    return config;
  }
};

export default nextConfig;
