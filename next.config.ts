import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is reached through a proxied host in cloud/preview environments, which Next
  // otherwise treats as a cross-origin request and blocks — taking HMR and client bootstrap with it.
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0", "*.cursor.sh", "*.trycloudflare.com"],
  agentRules: false,
};

export default nextConfig;
