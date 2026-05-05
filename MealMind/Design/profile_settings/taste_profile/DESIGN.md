---
name: Vitality Core
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0ede9'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#404943'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#2b694d'
  on-secondary: '#ffffff'
  secondary-container: '#b0f1cc'
  on-secondary-container: '#327053'
  tertiary: '#6e3a0b'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a5122'
  on-tertiary-container: '#ffd0b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#b0f1cc'
  secondary-fixed-dim: '#94d4b1'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#0c5136'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb782'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6d390b'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-mobile: 20px
  margin-desktop: 40px
  gutter: 16px
  touch-target-min: 44px
---

## Brand & Style

This design system is built to evoke a sense of calm, capability, and nutritional clarity. The brand personality is that of a supportive coach: knowledgeable but never overbearing, organized but flexible. 

The visual style follows a **Modern Minimalist** approach infused with **Tonal Layering**. By prioritizing whitespace and a soft, organic color palette, the interface reduces the cognitive load of meal planning. High-quality imagery of fresh ingredients is framed by structured, spacious layouts to inspire healthy living while maintaining a professional, medical-grade trustworthiness.

## Colors

The palette is anchored by "Evergreen," a deep, trustworthy primary green that symbolizes health and growth. The background uses warm neutrals rather than stark whites to create a more inviting, "kitchen-table" feel. 

**Dark Mode Strategy:**
In dark mode, the warm neutral backgrounds shift to a deep charcoal-green (#1B2420). Surface colors utilize tonal shifts (slighter lighter greens) rather than pure greys to maintain the brand’s organic identity.

**Dietary Accents:**
Soft, desaturated tones are used to categorize recipes (e.g., pale terracotta for high-protein, soft sage for vegan) to ensure categories are distinguishable without competing with the primary brand color.

## Typography

The typographic scale prioritizes legibility in the kitchen environment, where a user might be viewing their device from a distance. 

- **Headings:** **Plus Jakarta Sans** provides a friendly, contemporary character with its slightly rounded terminals, making the app feel encouraging.
- **Body & Metadata:** **Manrope** is used for its exceptional balance and utilitarian clarity. Its geometric influence ensures that nutritional data and ingredient lists remain highly readable at various scales.
- **Accessibility:** All body text must maintain a minimum contrast ratio of 4.5:1. Line lengths for recipe instructions are capped at 70 characters to improve focus.

## Layout & Spacing

This design system employs a **fluid 8pt grid system**. Spacing is generous to reinforce the "organized" brand pillar, ensuring that users never feel overwhelmed by information density.

- **Margins:** Mobile layouts use a 20px side margin to ensure content doesn't feel cramped.
- **Padding:** Vertical rhythm is maintained by using multiples of 8px (e.g., 16px between list items, 32px between sections).
- **Touch Safety:** Every interactive element adheres to a minimum 44px square hit area, regardless of the visual size of the icon or label, accommodating users who may have wet or messy hands while cooking.

## Elevation & Depth

To maintain a clean and trustworthy aesthetic, this design system uses **Tonal Layers** combined with **Ambient Shadows**. 

- **Level 0 (Background):** The base neutral color.
- **Level 1 (Cards/Surface):** White (in light mode) or slightly lightened green (in dark mode) with a very soft, diffused shadow (12% opacity, 16px blur, 4px Y-offset).
- **Level 2 (Modals/Overlays):** These use a more pronounced shadow and a subtle backdrop blur (10px) to pull the user's focus forward.
- **Interactive Depth:** Buttons use a slight "press" effect (reducing elevation) rather than heavy gradients to signal interaction.

## Shapes

The shape language is consistently **Rounded**. This choice mirrors the "soft and approachable" brand personality and aligns with the 12px-16px requirement.

- **Primary Cards:** 16px corner radius to feel substantial and safe.
- **Buttons & Input Fields:** 12px corner radius for a modern, friendly feel.
- **Chips & Tags:** 100px (fully pill-shaped) to clearly distinguish them from actionable buttons or data cards.
- **Progress Bars:** Fully rounded ends to suggest a journey and positive momentum.

## Components

**Buttons**
- **Primary:** Solid "Evergreen" background with white text. High contrast and prominent.
- **Secondary:** Outlined with a 2px stroke of the primary color.
- **Destructive:** Clearly separated via a soft red (#BC4749) text link or outline, never using the primary green.

**Cards (Recipe/Meal)**
Recipe cards feature a 16px radius and use a subtle shadow. Nutritional highlights (Calories, Carbs, Protein) are displayed as small pill-shaped chips at the bottom of the card for quick scanning.

**Input Fields**
Standardized 48px height for accessibility. They use a 1px soft-neutral border that thickens and changes to "Evergreen" on focus. Labels always remain visible above the field to assist users with cognitive clarity.

**Dietary Chips**
Small, colored badges with low-saturation backgrounds that help users filter meals by diet (e.g., "Keto", "Gluten-Free") without cluttering the visual hierarchy.

**Meal Calendar**
A custom component utilizing a clean, horizontal scroll of dates with large, 44px touch-target day-nodes, ensuring meal logging is a frictionless experience.