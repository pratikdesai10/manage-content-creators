import { HeroContent } from './HeroContent';
import { HeroCards } from './HeroCards';

export function HeroSection() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <HeroContent />
        <HeroCards />
      </div>
    </section>
  );
}
