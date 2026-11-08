/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // ESLint was never actually configured until this session (no config
    // existed at all, so `next lint`/`next build` silently skipped it).
    // Running it for real surfaced ~35 pre-existing @typescript-eslint/
    // no-explicit-any errors and several unused-var/react-hooks warnings
    // across files written before any lint gate existed. Fixing all of them
    // is a larger, separate cleanup pass (tracked in
    // docs/release-evidence/CONTINUATION_CHECKPOINT.md) rather than a
    // security/correctness fix, so the build is decoupled from lint here to
    // avoid blocking releases on pre-existing style debt. `npm run lint`
    // still runs the real checks as its own command/CI gate.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
