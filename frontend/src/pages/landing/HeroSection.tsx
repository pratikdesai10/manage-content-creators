import { HeroContent } from './HeroContent';
import { PhoneHero } from './PhoneHero';

export function HeroSection() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <HeroContent />
        <PhoneHero />
      </div>
    </section>
  );
}
