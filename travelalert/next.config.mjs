/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// In production Next.js does not need 'unsafe-eval' — the client bundle is
// already compiled and shipped as valid JS. In dev, React Refresh and the
// webpack HMR runtime both eval, so keeping the directive in dev avoids a
// broken hot-reload loop.
//
// 'unsafe-inline' is required in both modes: the theme-init <script> in
// layout.js and the JSON-LD `dangerouslySetInnerHTML` blocks on every page
// rely on inline script execution.
const scriptSrc = isProd
  ? "'self' 'unsafe-inline' https://www.googletagmanager.com"
  : "'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src ${scriptSrc}; ` +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;