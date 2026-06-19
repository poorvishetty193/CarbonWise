import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com'],
  },
  // Mark firebase packages as server-side externals so they aren't processed by Babel
  experimental: {
    serverComponentsExternalPackages: ['firebase', '@firebase/auth', '@firebase/firestore', 'firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // `undici` is a Node.js-only HTTP client bundled inside newer firebase builds.
      // Browsers use native fetch, so we don't need undici in the client bundle.
      // Aliasing to false prevents Babel from failing on its private class method syntax.
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "connect-src 'self' https://api.anthropic.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com;",
              "img-src 'self' data: https://*.googleusercontent.com https://images.unsplash.com;",
              "frame-src 'self' https://*.firebaseapp.com https://*.web.app;",
              "object-src 'none';",
              "upgrade-insecure-requests;"
            ].join(' ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  }
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
