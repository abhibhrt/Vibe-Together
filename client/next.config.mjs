import withPWA from 'next-pwa';

const baseConfig = {
  reactCompiler: true,
  experimental: {
    turbo: {
      enabled: false
    }
  }
};

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true
})(baseConfig);

export default nextConfig;
