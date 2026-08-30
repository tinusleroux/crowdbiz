import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres", "apify-client", "yaml"],
  agentRules: false,
};

export default nextConfig;
