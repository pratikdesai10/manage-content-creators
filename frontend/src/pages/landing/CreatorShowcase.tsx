import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

const creators = [
  { name: 'Alex Rivera', niche: 'Tech Reviews', followers: '890K', initials: 'AR', color: 'from-indigo-500 to-blue-500' },
  { name: 'Priya Sharma', niche: 'Lifestyle', followers: '1.2M', initials: 'PS', color: 'from-purple-500 to-pink-500' },
  { name: 'Jordan Lee', niche: 'Fitness', followers: '650K', initials: 'JL', color: 'from-emerald-500 to-teal-500' },
  { name: 'Maya Johnson', niche: 'Beauty', followers: '2.1M', initials: 'MJ', color: 'from-pink-500 to-rose-500' },
  { name: 'Chris Park', niche: 'Gaming', followers: '1.5M', initials: 'CP', color: 'from-orange-500 to-amber-500' },
  { name: 'Sofia Martinez', niche: 'Travel', followers: '780K', initials: 'SM', color: 'from-cyan-500 to-blue-500' },
];

function CreatorCard({ creator }: { creator: typeof creators[number] }) {
  return (
    <div className="creator-card flex-shrink-0 w-64 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 ease-out">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center mb-4 text-white font-bold text-lg`}>
        {creator.initials}
      </div>
      <h3 className="font-semibold text-lg">{creator.name}</h3>
      <p className="text-gray-400 text-sm">{creator.niche}</p>
      <p className="text-indigo-400 text-sm font-medium mt-2">{creator.followers} followers</p>
    </div>
  );
}

export function CreatorShowcase() {
  const duplicated = [...creators, ...creators];
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('.creator-card');
    const mouseX = e.clientX;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - cardCenterX);
      const maxDistance = 300;

      if (distance < maxDistance) {
        const proximity = 1 - distance / maxDistance;
        const scale = 1 + proximity * 0.15;
        const translateY = -proximity * 8;
        card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      } else {
        card.style.transform = 'scale(1) translateY(0px)';
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('.creator-card');
    cards.forEach((card) => {
      card.style.transform = 'scale(1) translateY(0px)';
    });
  }, []);

  return (
    <section className="relative z-10 py-20 overflow-hidden">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Top Creators on CollabHub
      </motion.h2>
      <motion.p
        className="text-gray-400 text-center mb-12 max-w-xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Join thousands of creators already growing with us
      </motion.p>

      {/* Auto-scrolling marquee */}
      <div
        className="relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#050510] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#050510] to-transparent z-10 pointer-events-none" />

        <div
          ref={containerRef}
          className="flex gap-6 items-end py-4 animate-marquee group-hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {duplicated.map((creator, i) => (
            <CreatorCard key={`${creator.name}-${i}`} creator={creator} />
          ))}
        </div>
      </div>
    </section>
  );
}
