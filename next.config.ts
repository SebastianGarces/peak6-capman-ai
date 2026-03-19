import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip static prerendering of the internal /_global-error route.
  // Next.js 16.2.0 attempts to prerender it with the root layout,
  // which fails because ThemeProvider's useContext has no dispatcher
  // during the prerender worker phase.
  experimental: {
    prerenderEarlyExit: false,
  },
};


export default nextConfig;
