/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Same-origin Firebase Auth helper (fixes Google redirect on Chrome).
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination:
          'https://shipping-buying-6955.firebaseapp.com/__/auth/:path*',
      },
    ]
  },
  // Lets Firebase Google popup finish its window.closed handoff.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

export default nextConfig
