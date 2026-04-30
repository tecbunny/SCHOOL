import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    // If in standalone EduOS mode, force the root to the student dashboard
    if (process.env.EDUOS_STANDALONE === 'true') {
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
