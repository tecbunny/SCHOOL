import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.0.119'],
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
