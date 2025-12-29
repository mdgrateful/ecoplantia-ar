/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor iOS/Android builds
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,

  // Disable image optimization for static export (Capacitor)
  images: {
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'ccjniauqjowpsvibljsz.supabase.co',
      },
    ],
  },

  // Trailing slash for better static hosting compatibility
  trailingSlash: process.env.CAPACITOR_BUILD === 'true',
}

module.exports = nextConfig
