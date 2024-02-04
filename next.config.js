/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  reactStrictMode: false,
  experimental: {
    workerThreads: true,
    cpus: 4,
    instrumentationHook: true,
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
