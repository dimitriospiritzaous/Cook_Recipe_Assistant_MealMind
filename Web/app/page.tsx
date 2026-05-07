import { DownloadSection } from '@/components/landing/download';
import { FaqSection } from '@/components/landing/faq';
import { FeaturesSection } from '@/components/landing/features';
import { FoodGallerySection } from '@/components/landing/food-gallery';
import { SiteFooter } from '@/components/landing/footer';
import { GuidedJourneySection } from '@/components/landing/guided-journey';
import { SiteHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero';
import { HowItWorksSection } from '@/components/landing/how-it-works';
import { NewsletterSection } from '@/components/landing/newsletter';
import { PricingSection } from '@/components/landing/pricing';
import { ProductStorySection } from '@/components/landing/product-story';
import { SectionDivider } from '@/components/landing/section-divider';
import { VideoSpotlightSection } from '@/components/landing/video-spotlight';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProductStorySection />
        <FoodGallerySection />
        <SectionDivider tone="to-low" />
        <VideoSpotlightSection />
        <SectionDivider tone="to-surface" />
        <HowItWorksSection />
        <GuidedJourneySection />
        <SectionDivider tone="to-low" />
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
