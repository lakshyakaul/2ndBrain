import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pxjwfpzpeaqrxnyievua.supabase.co',
      },
    ],
  },
};

export default nextConfig;
