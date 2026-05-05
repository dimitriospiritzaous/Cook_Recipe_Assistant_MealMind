import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';

import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['600', '700', '800'],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin'],
  variable: '--font-be-vietnam',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'MealMind — The culinary curator for your kitchen',
    template: '%s · MealMind',
  },
  description:
    'Turn what you have into what you want to eat. MealMind matches ingredients, time, and taste to curated recipe ideas—editorial calm, not spreadsheet stress.',
  metadataBase: new URL('https://mealmind.app'),
  openGraph: {
    title: 'MealMind — The culinary curator for your kitchen',
    description:
      'Ingredient-first AI meal planning with scan, taste profile, and favorites. For busy home cooks.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
