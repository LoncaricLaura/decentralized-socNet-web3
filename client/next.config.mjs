/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'localhost',
        '192.168.1.29',
        '192.168.1.70'
    ],
    },
    reactStrictMode: false
  };
export default nextConfig;
