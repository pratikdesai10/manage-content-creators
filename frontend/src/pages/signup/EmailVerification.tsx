import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resendVerificationEmail } from '../../api/endpoints';

export function EmailVerification() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const handleResend = async () => {
    setCanResend(false);
    try {
      await resendVerificationEmail();
      setCountdown(60);
      toast.success('Verification email resent!');
    } catch {
      setCanResend(true);
      toast.error('Failed to resend email. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Check your inbox!</h1>
        <p className="text-gray-400 mb-6">
          We've sent a verification link to your email address.
        </p>
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
        </button>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 block mx-auto"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
}
