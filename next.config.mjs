/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the /book page to be embedded in WordPress via iframe
  async headers() {
    return [
      {
        source: '/book/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
