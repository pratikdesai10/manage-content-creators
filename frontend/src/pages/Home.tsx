import { useEffect } from 'react';
import { ParticleCanvas } from './landing/ParticleCanvas';
import { GlowOrbs } from './landing/GlowOrbs';
import { HeroSection } from './landing/HeroSection';
import { StatsBar } from './landing/StatsBar';
import { HowItWorks } from './landing/HowItWorks';
import { FeaturesBentoGrid } from './landing/FeaturesBentoGrid';
import { CreatorShowcase } from './landing/CreatorShowcase';
import { FinalCTA } from './landing/FinalCTA';

export function Home() {
  useEffect(() => {
    const bg = '#050510';
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="landing-page bg-[#050510] text-white -mt-16 pt-16 relative overflow-hidden min-h-screen">
      <ParticleCanvas />
      <GlowOrbs />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesBentoGrid />
      <CreatorShowcase />
      <FinalCTA />
    </div>
  );
}
