import { motion } from 'framer-motion';
import { UserPlus, Search, Rocket } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Profile',
    description: 'Set up your creator or brand profile in minutes with our guided signup flow.',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Search,
    title: 'Get Discovered',
    description: 'Our matching engine connects you with the perfect collaboration partners.',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Rocket,
    title: 'Collaborate & Grow',
    description: 'Work together on campaigns, track results, and scale your impact.',
    gradient: 'from-pink-500 to-pink-600',
  },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        How It Works
      </motion.h2>
      <motion.p
        className="text-gray-400 text-center mb-12 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Three simple steps to start collaborating
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center group hover:bg-white/[0.08] transition-colors duration-300"
          >
            <div className="relative mb-6 inline-flex">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/10 border border-white/20 text-xs font-bold flex items-center justify-center text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            <p className="text-gray-400 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
