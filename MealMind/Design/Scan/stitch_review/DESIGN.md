# Design System Strategy: The Culinary Editorial

## 1. Overview & Creative North Star
This design system is built upon the "Digital Sommelier" North Star. It rejects the clinical, cold nature of standard food apps in favor of an editorial, warm-invitation aesthetic. We move beyond basic templates by embracing high-contrast typographic scales and intentional "Tonal Layering."

The system mimics the tactile experience of a premium cookbook: soft-touch paper, organic curves, and a palette that feels grown, not manufactured. We achieve a "custom" feel by using asymmetrical layout compositions (e.g., overlapping elements and varying card heights) to break the rigid digital grid.

## 2. Colors: The Earth & Harvest Palette
The palette is rooted in organic tones—Deep Cocoa (`primary`), Sage (`secondary`), and a Warm Parchment (`surface`).

### The "No-Line" Rule
Designers are strictly prohibited from using 1px solid borders to define sections. Layout boundaries must be created exclusively through background color shifts. For example, a `surface-container-low` (`#f7f3ee`) section should sit against a `surface` (`#fdf9f4`) background to provide distinction.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of fine paper. Use Material tokens to define depth:
*   **Base:** `surface` (#fdf9f4)
*   **Subtle Recess:** `surface-container-low` (#f7f3ee) for large background sections.
*   **Primary Containers:** `surface-container` (#f1ede8) for interactive cards.
*   **Floating Elements:** `surface-container-lowest` (#ffffff) for high-impact content that needs to "pop" without a shadow.

### The "Glass & Gradient" Rule
To add a premium signature, use Glassmorphism for floating navigation or top bars. Use `surface` colors at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Gradients:** For primary CTAs, use a subtle linear gradient from `primary` (#6c3a00) to `primary_container` (#8d4e03) at a 135-degree angle. This adds "soul" and depth to the flat color.

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** to balance modern efficiency with approachable curves.

*   **Display (lg/md/sm):** Used for "What's in your kitchen?" hero moments. These should always be `on_background` (#1c1c19) with tight letter spacing (-0.02em) to mimic a magazine header.
*   **Headline (lg/md/sm):** Reserved for section titles like "Recent Cookbooks." These act as the anchor points for the eye.
*   **Body (lg/md):** High readability for recipe descriptions and ingredient lists.
*   **Labels (md/sm):** Used for metadata (dates, times). Always use `on_surface_variant` (#534438) to ensure they feel secondary but legible.

The hierarchy is intentionally steep—large displays paired with significantly smaller, well-spaced body text create the "Editorial" look.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a fallback, not a standard. We convey hierarchy through color elevation.

*   **The Layering Principle:** Place a `surface-container-highest` card on a `surface` background to create natural lift.
*   **Ambient Shadows:** If a floating action button or "Chef's Pick" card requires a shadow, it must be highly diffused: `box-shadow: 0 12px 32px rgba(46, 21, 0, 0.06)`. Note the shadow color is a tint of our `on_primary_fixed` (#2e1500), not a neutral grey.
*   **The "Ghost Border":** If a border is required for accessibility (e.g., in high-contrast modes), use the `outline_variant` (#d8c3b3) at 20% opacity. 100% opaque borders are prohibited.

## 5. Components

### Buttons & Chips
*   **Primary Buttons:** Fully rounded (`full`: 9999px), using the Signature Gradient. Text is `on_primary` (#ffffff).
*   **Secondary/Filter Chips:** Use `secondary_container` (#d6e5bf) with `on_secondary_container` (#5a6749) text. These should feel "leafy" and light. 
*   **Interaction State:** On press, scale the component down slightly (0.98) rather than just changing color.

### Inputs
*   **Search Fields:** Use `surface_container` with a `xl` (3rem) corner radius. The icon should be `primary` (#6c3a00) to act as a focal point.

### Cards & Lists
*   **The Divider Prohibition:** Do not use line dividers between list items. Use 16px to 24px of vertical white space (Spacing Scale) to separate content blocks.
*   **Image Integration:** Recipe cards should feature images with a `lg` (2rem) corner radius. Overlap text elements (like "Chef's Pick" badges) over the image corner to create a layered, custom feel.

### Navigation Bar
*   **Active State:** Use a pill-shaped container of `primary_fixed` (#ffdcc1) behind the active icon. This creates a soft "highlight" effect seen in high-end curation apps.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a headline might have a larger left margin than the body text below it to create visual interest.
*   **Do** use "Warm White" (#fdf9f4) instead of pure white (#ffffff) for backgrounds to reduce eye strain and maintain the earthy aesthetic.
*   **Do** apply the `xl` (3rem) corner radius to large image containers to maintain the "friendly" brand voice.

### Don't:
*   **Don't** use black (#000000) for text. Use `on_surface` (#1c1c19) to keep the contrast soft and sophisticated.
*   **Don't** use standard Material "elevated" cards with heavy shadows. Use background color shifts (`surface-container` tiers) first.
*   **Don't** use "Alert Red" for non-critical errors. Use the `error` (#ba1a1a) tone sparingly to avoid breaking the warm, inviting mood of the system.