import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

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

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    // TODO: call resend email API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-white px-4">
      <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address.
        </p>
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="w-full py-2.5 px-4 rounded-xl font-medium transition bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
        </button>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-sm text-purple-600 hover:underline block mx-auto"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
