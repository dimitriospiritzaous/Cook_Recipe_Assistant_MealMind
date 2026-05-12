import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { NextConfig } from 'next';

/*
 * Node 25+ exposes globalThis.localStorage but it is non-functional unless
 * --localstorage-file is configured. Libraries like @supabase/supabase-js
 * detect `localStorage` and call getItem/setItem, which throws. Provide a
 * no-op shim so SSR and route handlers don't crash.
 */
if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof globalThis.localStorage?.getItem !== 'function'
) {
  const noop = () => null;
  globalThis.localStorage = {
    getItem: noop,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: noop as unknown as (index: number) => string | null,
    length: 0,
  } as Storage;
}

/**
 * Reuse Supabase credentials from the Expo app during local dev when Web/.env.local
 * has not been created yet. Does not override vars already set by Next or the shell.
 */
function mergeRecipeAppEnvIntoProcess(): void {
  const envPath = path.resolve(__dirname, '../MealMind/App/RecipeApp/.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

mergeRecipeAppEnvIntoProcess();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
