import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { BarChart3, Shield, Zap, Globe, MessageSquare, Palette } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Smart Matching',
    description: 'AI-powered algorithm finds your ideal collaboration partners based on niche, audience, and goals. Get matched with brands and creators that align with your values and content style.',
    featured: true,
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights on reach, engagement, and campaign performance.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Escrow-protected payments ensure fair compensation for every collaboration.',
  },
  {
    icon: MessageSquare,
    title: 'Built-in Messaging',
    description: 'Communicate directly with brands and creators without leaving the platform.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connect with creators and brands worldwide.',
  },
  {
    icon: Palette,
    title: 'Portfolio Showcase',
    description: 'Display your best work with beautiful, customizable profiles.',
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 8;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ${className ?? ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export function FeaturesBentoGrid() {
  const featured = features[0];
  const sideCards = features.slice(1, 3);
  const bottomCards = features.slice(3);

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Everything You Need
      </motion.h2>
      <motion.p
        className="text-gray-400 text-center mb-12 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Powerful tools for creators and brands to collaborate effectively
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Featured card — spans 2 cols and 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2 md:row-span-2"
        >
          <TiltCard className="h-full">
            <div className="h-full p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-purple-500/10 backdrop-blur-sm group hover:from-indigo-500/15 hover:to-purple-500/15 transition-colors duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <featured.icon className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{featured.title}</h3>
              <p className="text-gray-400 text-base leading-relaxed max-w-lg">{featured.description}</p>
            </div>
          </TiltCard>
        </motion.div>

        {/* Side cards — stacked in col 3 */}
        {sideCards.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i + 1) * 0.08 }}
          >
            <TiltCard className="h-full">
              <div className="h-full p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group hover:bg-white/[0.08] transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}

        {/* Bottom row — 3 equal cards */}
        {bottomCards.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i + 3) * 0.08 }}
          >
            <TiltCard className="h-full">
              <div className="h-full p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group hover:bg-white/[0.08] transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
