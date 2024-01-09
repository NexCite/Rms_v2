/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
    styledComponents: true,
  },

  reactStrictMode: false,
  experimental: {
    workerThreads: true,
    cpus: 4,
    instrumentationHook: true,
    nextScriptWorkers: true,
  },
};

module.exports = nextConfig;
