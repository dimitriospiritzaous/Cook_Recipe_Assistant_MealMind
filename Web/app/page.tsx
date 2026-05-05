import { DownloadSection } from '@/components/landing/download';
import { FaqSection } from '@/components/landing/faq';
import { FeaturesSection } from '@/components/landing/features';
import { SiteFooter } from '@/components/landing/footer';
import { SiteHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { NewsletterSection } from '@/components/landing/newsletter';
import { PricingSection } from '@/components/landing/pricing';
import { SectionDivider } from '@/components/landing/section-divider';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <SectionDivider tone="to-low" />
        <HowItWorksSection />
        <SectionDivider tone="to-surface" />
        <FeaturesSection />
        <SectionDivider tone="to-low" />
        <PricingSection />
        <DownloadSection />
        <FaqSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </>
  );
}
