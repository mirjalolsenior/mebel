// ...existing code...
/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // o'zgartirildi: export o'rniga serverli rejim uchun standalone
  output: 'standalone',
  experimental: {
    esmExternals: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://raw.githack.com https://raw.githubusercontent.com; img-src 'self' data: https:; font-src 'self' data:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;",
          },
        ],
      },
    ]
  },
}
// ...existing code...
// ...existing code...
/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // o'zgartirildi: export o'rniga serverli rejim uchun standalone
  output: 'standalone',
  experimental: {
    esmExternals: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://raw.githack.com https://raw.githubusercontent.com; img-src 'self' data: https:; font-src 'self' data:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;",
          },
        ],
      },
    ]
  },
}
// ...existing code...