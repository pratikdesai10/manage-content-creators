import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroContent() {
  return (
    <motion.div
      className="flex flex-col justify-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Where Creators
        </span>
        <br />
        <span className="text-white">Meet Opportunity</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-lg">
        CollabHub connects content creators with agencies and brands for
        meaningful collaborations that drive growth.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/signup/creator"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
        >
          Join as Creator
        </Link>
        <Link
          to="/signup/agency"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold border border-white/20 text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
        >
          Join as Agency
        </Link>
      </div>
    </motion.div>
  );
}
