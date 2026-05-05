# MealMind — Marketing / landing website requirements

Document for implementing a **public marketing site** that represents the **MealMind** mobile app (Expo / React Native) and drives installs, sign-ups, and trust. This is **not** a spec for re-building the app in the browser unless you explicitly add a web-app phase later.

---

## 1. Purpose

- **Primary:** Explain what MealMind does, for whom, and why it’s different; convert visitors to **app download** (iOS / Android) and optionally **email waitlist** or **newsletter**.
- **Secondary:** Support **SEO** for brand and category terms; host or link **Terms**, **Privacy**, **Support**, and **press** assets.
- **Tertiary:** Deep-link or universal-link into the app where relevant (e.g. after account creation flows you add later).

---

## 2. Product summary (source of truth for copy)

**MealMind** is an AI-assisted **meal planner / recipe curator**: users enter **ingredients they have** (typed, from recents, or via **scan from camera or photo library**), choose **meal type**, **cooking time**, and **cooking style**, then get **curated recipe ideas** with rich detail cards. A **personal taste profile** (onboarding wizard + Supabase-backed profile) shapes suggestions. Users can **save favorites**, manage **subscription tiers** (Free vs Pro in product vision), and sign in with **email / OAuth** (e.g. Google, Apple) via Supabase.

**Creative north star (from design system):** *“The Culinary Curator”* — editorial, warm, premium lifestyle-magazine feel; **not** a sterile utility grid. Busy home cooks; calm, tactile UI metaphors (kitchen counter, not spreadsheet).

---

## 3. Target audience

- Home cooks who ask: *“What can I make with what I have?”*
- People who want **faster decisions** (time-bound), **diet / allergy / taste** awareness, and **visual, appetizing** inspiration.
- Secondary: gift-givers / health-focused users if you lean into “personalized nutrition” messaging (align with in-app subscription copy).

---

## 4. Brand & voice

| Aspect | Guidance |
|--------|----------|
| **Name** | MealMind (in-app subscription screen uses “MealMind”; Expo config may still say “RecipeApp” — **customer-facing name: MealMind**). |
| **Tone** | Warm, confident, editorial; short sentences; avoid jargon (“RAG”, “LLM”) on the landing page. |
| **Visual** | Light-first, warm neutrals, **glow-style primary CTA** (amber / orange gradient), generous whitespace, food photography that matches the app’s quality bar. |
| **Avoid** | Pure black backgrounds for body text; harsh divider lines everywhere; cluttered feature grids without breathing room. |

---

## 5. Design tokens (align with app)

Use as **CSS variables** or design-handoff tokens so the site feels like the same product:

**Colors (from app `mealmind-colors`):**

- Surface / page background: `#fef8f5`
- Primary (text accents, links): `#8f4e00`
- Primary container / gradient end: `#ff9f43`
- On-surface (body text): `#1d1b1a` (not `#000000`)
- Secondary / nature accent: `#566342`, secondary container `#d7e5bb`
- Outline / muted: `#877365`, `#dac2b1`

**Typography (from app + design doc):**

- **Headlines:** Plus Jakarta Sans (weights 600–800), tight letter-spacing (~`-0.02em`).
- **Body / UI:** Be Vietnam Pro (400–600).

**Components (conceptual):**

- Primary button: **linear gradient** primary → primary-container (~135°), pill or large radius.
- Cards: large radius, no heavy borders; separation via **surface shifts** and soft shadow if needed.

---

## 6. Features to communicate (map to real app behavior)

When writing copy, these capabilities **exist or are planned in the product** — keep claims accurate to what you ship:

1. **Ingredient-first flow** — Type what’s in the fridge; comma-separated; quick chips / recents where applicable.
2. **Smart filters** — Meal type (breakfast, lunch, dinner, etc.), cooking time bands, cooking style (sheet pan, one-pot, no-cook, etc.).
3. **AI recipe generation / curation** — “Find my meal” → loading experience → recipe results (position as *personalized ideas*, not guaranteed medical nutrition advice unless you add compliance review).
4. **Scan ingredients** — Camera / photo library to capture ingredients (permissions copy exists in app config).
5. **Taste profile & onboarding** — Multi-step personalization (diet, allergies, cuisines, equipment, spice, calories, etc.); synced profile (Supabase).
6. **Favorites** — Save recipes for later.
7. **Account** — Sign in / sign up; OAuth; session management.
8. **Subscription** — Free vs **MealMind Pro** narrative (see in-app bullets: unlimited AI recipes, personalization, offline, grocery lists, support — **verify** each before promising on the web).

Optional **explore / category** deep links if you expose them on home (e.g. URL params that pre-set filters) — can be a “Discover” story on the site with the same slug names as the app.

---

## 7. Suggested information architecture

Minimum viable site:

| Page / section | Goal |
|----------------|------|
| **Home / Hero** | Value prop, primary CTA (Get the app), hero imagery, 3–4 benefit bullets. |
| **How it works** | 3 steps: Add ingredients → Set constraints → Get recipes. |
| **Features** | Scan, AI curation, taste profile, favorites (icons + short copy). |
| **Pricing** | Mirror Free vs Pro; link to in-app purchase or Stripe later — **do not invent prices**; app currently shows **$0**, **$79.99/year**, **$9.99/month** on subscription screen — confirm before publish. |
| **Download** | App Store + Google Play badges; QR optional for desktop→mobile. |
| **FAQ** | Ingredients privacy, account deletion, offline, what AI does/doesn’t do. |
| **Legal** | Terms & Privacy — app references `https://mealmind.app/terms` and `https://mealmind.app/privacy`; **implement or redirect** these on the live domain. |
| **Contact / Support** | Email or form; link from footer. |

Nice-to-have:

- **Blog / recipes** (SEO).
- **Press kit** (logo, screenshots, one-pager).

---

## 8. Content requirements

- **Hero headline + subhead** — One line promise + one line proof (speed, personalization, calm UX).
- **Screenshot / device frames** — Use real app screens: Home (ingredients + Find My Meal), Loading, Recipe detail, Favorites, Profile / taste summary. Keep updated per release.
- **Social proof** — Add only when you have real quotes / numbers; placeholders are fine in dev.
- **Accessibility** — WCAG-minded contrast (especially orange on cream); semantic headings; alt text on food images.

---

## 9. Technical & integration notes

- **Domain:** Plan for `mealmind.app` (or your final domain) to match in-app legal URLs and OAuth redirect documentation (see app `.env.example` for Supabase redirect patterns: `recipeapp://`, `exp://`, etc.).
- **Analytics:** Plausible, GA4, or PostHog — document events: `cta_app_store_click`, `cta_play_store_click`, `scroll_features`, `newsletter_submit`.
- **Performance:** LCP-friendly hero image; static export or edge-cached HTML if using a framework (Next.js, Astro, etc.).
- **No requirement** to share the Expo web build as the marketing site; a dedicated marketing repo/stack is fine.

---

## 10. Non-goals (for v1 landing)

- Full **web app** parity with mobile (generating recipes in-browser) unless you scope it separately.
- Replacing **Supabase Auth** or **in-app subscription** UI — the site sells and routes; purchases may remain in-app.

---

## 11. Open questions (fill in before launch)

- Final **App Store / Play Store** URLs and **bundle IDs** for smart banners.
- Which **Pro features** are live vs roadmap (keep landing claims in sync).
- **Medical / nutrition** disclaimers if you emphasize health outcomes.
- **Markets** and **languages** for v1.

---

## 12. Reference paths in this repo

- App brand colors: `MealMind/App/RecipeApp/constants/mealmind-colors.ts`
- Typography: `MealMind/App/RecipeApp/constants/mealmind-typography.ts`
- Design narrative: `MealMind/Design/harvest_hearth/DESIGN.md`
- Subscription messaging example: `MealMind/App/RecipeApp/app/(tabs)/profile/subscription.tsx`

---

*Last updated to match the MealMind app codebase as a product brief for an external marketing site implementation.*
