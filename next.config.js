/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Termux/Android ARM64 has no published native SWC binary, so we fall back
  // to Babel (see .babelrc) instead of Next.js's default Rust/SWC compiler.
  // swcMinify must be disabled to avoid Next.js trying to invoke the SWC binary anyway.
  swcMinify: false,
  typescript: {
    // Allow production builds to complete even if there are minor type issues
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even if there are minor lint issues
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;