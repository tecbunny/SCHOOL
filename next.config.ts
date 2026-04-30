import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.0.119'],
  async redirects() {
    const isStandalone = process.env.EDUOS_STANDALONE === 'true';
    
    // If in standalone EduOS mode, force the root to the student dashboard
    if (isStandalone) {
      return [
        {
          source: '/',
          destination: '/school/dashboard/student',
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
