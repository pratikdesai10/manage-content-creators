import { useCountUp } from '../../hooks/useCountUp';

const stats = [
  { target: 10, suffix: 'K+', label: 'Creators' },
  { target: 500, suffix: '+', label: 'Brands' },
  { target: 2, suffix: 'M+', label: 'Paid Out', prefix: '$' },
];

function StatItem({ target, suffix, label, prefix }: { target: number; suffix: string; label: string; prefix?: string }) {
  const { count, ref } = useCountUp(target);

  return (
    <div ref={ref} className="text-center">
      <p className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
        {prefix}{count}{suffix}
      </p>
      <p className="text-gray-400 text-xs sm:text-sm mt-1">{label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-3 gap-4 sm:gap-8 p-4 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
