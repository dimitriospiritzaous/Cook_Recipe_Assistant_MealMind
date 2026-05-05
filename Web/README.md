# MealMind marketing site

Next.js + Tailwind landing page implementing [`../requirement_landing.md`](../requirement_landing.md): hero, how it works, features, pricing, download, FAQ, newsletter, and `/terms` + `/privacy` placeholders.

## Setup

```bash
cd Web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Before launch

- Replace App Store / Google Play URLs in `components/landing/download.tsx`.
- Publish real legal copy on `/terms` and `/privacy`.
- Point `metadataBase` in `app/layout.tsx` at your production domain.
- Hook the newsletter form to your email provider and add analytics (see requirement doc).

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 3
- Fonts: Plus Jakarta Sans, Be Vietnam Pro (via `next/font`)
