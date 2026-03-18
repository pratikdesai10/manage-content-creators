import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { login } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors';

export function Login() {
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await login(data.email, data.password);
      authLogin(response);
      const role = response.user.role;
      navigate(role === 'CREATOR' ? '/dashboard/creator' : '/dashboard/agency');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Invalid email or password';
      setApiError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto px-4 py-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome back</h1>
      <p className="text-gray-400 text-center mb-8">Sign in to your CollabHub account</p>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
              {apiError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup/creator" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
