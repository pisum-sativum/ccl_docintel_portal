import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // If BACKEND_API_URL is defined in .env, use it, otherwise default to local FastAPI port
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
