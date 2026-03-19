import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export function FinalCTA() {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/agency';

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl p-16 sm:p-20 text-center"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-conic from-indigo-500 via-purple-500 via-pink-500 via-indigo-500 to-indigo-500 animate-spin-slow opacity-30" />
        <div className="absolute inset-[1px] rounded-3xl bg-[#0a0a1a]" />

        {/* Background layers */}
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
        <div className="absolute inset-[1px] rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

        {/* Floating decorative orbs */}
        <div className="absolute top-12 left-16 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-2xl animate-glow-drift pointer-events-none" />
        <div className="absolute bottom-12 right-16 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/15 to-indigo-500/10 blur-2xl animate-glow-drift-slow pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Collaborating?
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent blur-lg opacity-50" aria-hidden="true">
                Collaborating?
              </span>
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of creators and brands already growing together on CollabHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/creators"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  Explore Creators
                </Link>
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold border border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup/creator"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold border border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
