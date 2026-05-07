import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { NextConfig } from 'next';

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
