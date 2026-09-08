/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/portfolio.html', destination: '/portfolio' },
      { source: '/index.html', destination: '/' }
    ];
  }
};

export default nextConfig;
