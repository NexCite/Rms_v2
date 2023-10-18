/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  compiler: {
    emotion: true,
    styledComponents: true,
  },
};

module.exports = nextConfig;
