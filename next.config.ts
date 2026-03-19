import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Workaround for Next.js 16.2.0 bug where /_global-error fails to prerender
    // due to LayoutRouterContext being unavailable in the prerender worker.
    // Disabling Turbopack minification prevents the React dispatcher null issue.
    turbopackMinify: false,
    prerenderEarlyExit: false,
  },
};

export default nextConfig;
