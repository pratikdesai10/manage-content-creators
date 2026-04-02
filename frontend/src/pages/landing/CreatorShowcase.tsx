import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCreatorProfiles } from '../../api/endpoints';
import { CATEGORY_LABELS } from '../../types/creator.types';
import type { CreatorCategory } from '../../types/creator.types';

interface CreatorCard {
  name: string;
  niche: string;
  avatar: string;
  quote: string;
}

const fallbackCreators: CreatorCard[] = [
  {
    name: 'Alex Rivera',
    niche: 'Technology',
    avatar: 'https://i.pravatar.cc/120?img=11',
    quote: '🚀 CollabHub connected me with three brand deals in my first week. The platform just gets what creators need — no fluff, pure results.',
  },
  {
    name: 'Priya Sharma',
    niche: 'Lifestyle',
    avatar: 'https://i.pravatar.cc/120?img=47',
    quote: '✨ I used to chase brands on LinkedIn for months. Now they come to me. CollabHub completely changed how I do business.',
  },
  {
    name: 'Jordan Lee',
    niche: 'Fitness & Health',
    avatar: 'https://i.pravatar.cc/120?img=15',
    quote: '💪 The campaign workflow is seamless. From proposal to payment it\'s all in one place. I save hours every single week.',
  },
  {
    name: 'Maya Johnson',
    niche: 'Fashion & Beauty',
    avatar: 'https://i.pravatar.cc/120?img=49',
    quote: '💄 My revenue doubled in 6 months. CollabHub helped me find the right brand partners — not just any brand, the right ones.',
  },
  {
    name: 'Chris Park',
    niche: 'Gaming',
    avatar: 'https://i.pravatar.cc/120?img=53',
    quote: '🎮 Finally a platform built for creators, not agencies. The transparency in deal terms is honestly a game changer.',
  },
  {
    name: 'Sofia Martinez',
    niche: 'Travel',
    avatar: 'https://i.pravatar.cc/120?img=45',
    quote: '🌍 I\'ve tried every creator platform out there. CollabHub is the only one where I genuinely feel like a priority.',
  },
];

function TestimonialCard({ creator }: { creator: CreatorCard }) {
  return (
    <div className="creator-card flex-shrink-0 w-60 h-72 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 ease-out flex flex-col items-center text-center gap-4">
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-500/40"
      />
      <div>
        <p className="font-semibold text-white text-sm leading-tight">{creator.name}</p>
        <p className="text-indigo-400 text-xs mt-1">{creator.niche}</p>
      </div>
      <p className="text-white/75 text-xs leading-relaxed line-clamp-4">{creator.quote}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-60 h-72 p-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-white/10" />
      <div className="w-full flex flex-col items-center gap-2">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-2 w-16 rounded bg-white/10" />
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="h-2 w-full rounded bg-white/10" />
        <div className="h-2 w-5/6 rounded bg-white/10" />
        <div className="h-2 w-4/6 rounded bg-white/10" />
      </div>
    </div>
  );
}

export function CreatorShowcase() {
  const { data: profiles, isLoading, isError } = useQuery({
    queryKey: ['creators'],
    queryFn: getCreatorProfiles,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
  });

  const creators: CreatorCard[] = (!isError && profiles && profiles.length > 0)
    ? profiles.slice(0, 10).map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        niche: CATEGORY_LABELS[p.categories[0] as CreatorCategory] ?? p.categories[0] ?? 'Creator',
        avatar: p.profileImageUrl ?? `https://i.pravatar.cc/256?img=${(p.firstName.charCodeAt(0) % 70) + 1}`,
        quote: p.bio,
      }))
    : fallbackCreators;

  const displayCreators = isLoading
    ? null
    : [...creators, ...creators];

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
    <section className="relative z-10 py-16 overflow-hidden">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Trusted by Creators Who Mean Business
      </motion.h2>
      <motion.p
        className="text-gray-400 text-center mb-12 max-w-xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Don't take our word for it — hear from the creators already growing with CollabHub
      </motion.p>

      <div
        className="relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#050510] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#050510] to-transparent z-10 pointer-events-none" />

        {isLoading ? (
          <div className="flex gap-6 items-start py-4 px-4 overflow-hidden" style={{ width: 'max-content' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex gap-6 items-start py-4 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ width: 'max-content' }}
          >
            {displayCreators!.map((creator, i) => (
              <TestimonialCard key={`${creator.name}-${i}`} creator={creator} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
