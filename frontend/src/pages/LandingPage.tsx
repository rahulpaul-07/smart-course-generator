import { LandingNav } from '../components/landing/LandingNav';
import { LandingHero } from '../components/landing/LandingHero';
import { FeatureBento } from '../components/landing/FeatureBento';
import { EngineeringSection, FAQ, FinalCTA, HowItWorks } from '../components/landing/LandingSections';
import { LandingFooter } from '../components/landing/LandingFooter';

/**
 * Marketing page. Always rendered in the dark palette (the `dark` class scopes
 * the CSS variables to this subtree) so the first impression doesn't depend
 * on the visitor's OS theme; the app itself still follows their preference.
 */
export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30 [color-scheme:dark]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <LandingNav />
      <main id="main">
        <LandingHero />
        <FeatureBento />
        <HowItWorks />
        <EngineeringSection />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
