import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/prompts": ["./prompts/**/*"],
    "/api/prompts/**": ["./prompts/**/*"]
  }
};

export default nextConfig;
