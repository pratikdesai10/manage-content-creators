import { motion } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { Camera, TrendingUp, Handshake } from 'lucide-react';

const cards = [
  {
    title: 'Sarah Chen',
    subtitle: '120K Followers',
    icon: Camera,
    gradient: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30',
    delay: 0,
    offsetClass: 'lg:translate-x-4 lg:-translate-y-2',
  },
  {
    title: 'New Match!',
    subtitle: 'Nike x Sarah',
    icon: Handshake,
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    delay: 0.15,
    offsetClass: 'lg:-translate-x-4 lg:translate-y-4',
  },
  {
    title: '+248%',
    subtitle: 'Growth This Month',
    icon: TrendingUp,
    gradient: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-pink-500/30',
    delay: 0.3,
    offsetClass: 'lg:translate-x-8 lg:translate-y-2',
  },
];

export function HeroCards() {
  const parallaxRef = useMouseParallax(8);

  return (
    <div className="relative flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
      <div ref={parallaxRef} className="relative w-full max-w-md preserve-3d">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + card.delay, ease: 'easeOut' }}
            className={`
              ${i > 0 ? 'mt-4' : ''}
              ${card.offsetClass}
              relative p-5 rounded-2xl border ${card.borderColor}
              bg-gradient-to-br ${card.gradient}
              backdrop-blur-md
              transition-transform duration-300
              hover:scale-[1.02]
              animate-float
              hidden sm:block
            `}
            style={{
              animationDelay: `${card.delay * 2}s`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="font-semibold text-white">{card.title}</p>
                <p className="text-sm text-gray-400">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Mobile: show only first two cards without offset */}
        {cards.slice(0, 2).map((card) => (
          <motion.div
            key={`mobile-${card.title}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + card.delay }}
            className={`
              mt-4 first:mt-0
              relative p-5 rounded-2xl border ${card.borderColor}
              bg-gradient-to-br ${card.gradient}
              backdrop-blur-md
              animate-float
              sm:hidden
            `}
            style={{ animationDelay: `${card.delay * 2}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="font-semibold text-white">{card.title}</p>
                <p className="text-sm text-gray-400">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
