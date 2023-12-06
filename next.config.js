/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
    styledComponents: true,
  },
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
