import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  allowedDevOrigins: ['192.168.0.119', '192.168.73.1'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
  async redirects() {
    const isStandalone = process.env.EDUOS_STANDALONE === 'true';
    const role = process.env.EDUOS_ROLE ?? 'student-hub';
    const destination = role === 'class-station'
      ? '/school/teacher'
      : '/school/student';
    
    if (isStandalone) {
      return [
        {
          source: '/',
          destination,
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
