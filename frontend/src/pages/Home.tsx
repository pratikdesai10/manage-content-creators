import { HeroSection } from './landing/HeroSection';
import { StatsBar } from './landing/StatsBar';
import { HowItWorks } from './landing/HowItWorks';
import { FeaturesBentoGrid } from './landing/FeaturesBentoGrid';
import { CreatorShowcase } from './landing/CreatorShowcase';
import { FinalCTA } from './landing/FinalCTA';

export function Home() {
  return (
    <div className="landing-page text-white -mt-16 pt-16 relative overflow-hidden min-h-screen">
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesBentoGrid />
      <CreatorShowcase />
      <FinalCTA />
    </div>
  );
}
