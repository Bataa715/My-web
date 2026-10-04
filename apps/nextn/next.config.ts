import type {NextConfig} from 'next';
import path from 'node:path';
import fs from 'node:fs';

// ─── .env.local loader (workspace root + apps/nextn) ─────────────────────
// Next.js only reads env files next to this config (apps/nextn). Secrets that
// live in the workspace-root .env.local (shared by tooling) are merged in here
// BEFORE the rest of the config so both locations work. Real env vars win.
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const workspaceRoot = path.join(__dirname, '..', '..');
loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(workspaceRoot, '.env.local'));

const nextConfig: NextConfig = {
  /* config options here */
  // Monorepo: trace deps from workspace root (must match Vercel's outputFileTracingRoot).
  outputFileTracingRoot: workspaceRoot,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Inline NEXT_PUBLIC_* Supabase vars at build time so they are guaranteed
  // available in the client bundle (Turbopack + Nx workspace edge case).
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip trailing slash redirect for cleaner URLs
  skipTrailingSlashRedirect: true,
  // Tree-shake heavy barrel imports → faster dev compile + smaller client JS
  compiler: {
    // Strip console.log/debug from production bundles (keep error + warn).
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      'recharts',
      'lucide-react',
      'framer-motion',
      'date-fns',
      'react-i18next',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
