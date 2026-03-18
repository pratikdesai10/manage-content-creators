import { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreatorFormData } from '../../../../types/creator.types';
import { GENDER_OPTIONS } from '../../../../types/creator.types';
import { PasswordStrengthMeter } from '../shared/PasswordStrengthMeter';
import { PhoneInput } from '../shared/PhoneInput';
import { ImageUpload } from '../shared/ImageUpload';
import { checkUsername, checkEmail } from '../../../../api/endpoints';

interface PersonalInfoStepProps {
  form: UseFormReturn<CreatorFormData>;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors';

const currentYear = new Date().getFullYear();
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors,
  } = form;

  const displayName = watch('displayName');
  const password = watch('password');

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Date of birth state
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Debounced username check
  useEffect(() => {
    if (!displayName || displayName.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsername(displayName);
        setUsernameStatus(result.available ? 'available' : 'taken');
        if (!result.available) {
          setError('displayName', { message: 'Username is already taken' });
        } else {
          clearErrors('displayName');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [displayName, setError, clearErrors]);

  // Combine DOB fields
  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const month = String(Number(dobMonth)).padStart(2, '0');
      const day = String(Number(dobDay)).padStart(2, '0');
      setValue('dateOfBirth', `${dobYear}-${month}-${day}`);
    }
  }, [dobDay, dobMonth, dobYear, setValue]);

  async function handleEmailBlur() {
    const email = form.getValues('email');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailStatus('checking');
    try {
      const result = await checkEmail(email);
      setEmailStatus(result.available ? 'available' : 'taken');
      if (!result.available) {
        setError('email', { message: 'Email is already registered' });
      }
    } catch {
      setEmailStatus('idle');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Let's get to know you</h2>
        <p className="text-gray-400 mt-1">Fill in your personal details to create your creator account.</p>
      </div>

      {/* First Name + Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
          <input
            type="text"
            placeholder="John"
            {...register('firstName')}
            className={inputClass}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
          <input
            type="text"
            placeholder="Doe"
            {...register('lastName')}
            className={inputClass}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Display Name / Username */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Display Name / Username</label>
        <div className="relative">
          <input
            type="text"
            placeholder="john_doe"
            {...register('displayName')}
            className={inputClass}
          />
          {usernameStatus === 'checking' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Checking...</span>
          )}
          {usernameStatus === 'available' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">&#10003;</span>
          )}
          {usernameStatus === 'taken' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg">&#10007;</span>
          )}
        </div>
        {errors.displayName && <p className="mt-1 text-sm text-red-400">{errors.displayName.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
        <div className="relative">
          <input
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            onBlur={handleEmailBlur}
            className={inputClass}
          />
          {emailStatus === 'checking' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Checking...</span>
          )}
          {emailStatus === 'available' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">&#10003;</span>
          )}
          {emailStatus === 'taken' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg">&#10007;</span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">We'll send a verification link</p>
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
        <PhoneInput
          value={watch('phone')}
          onChange={(val) => setValue('phone', val)}
          error={errors.phone?.message}
        />
      </div>

      {/* Password + Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input
            type="password"
            placeholder="Min 8 characters"
            {...register('password')}
            className={inputClass}
          />
          <PasswordStrengthMeter password={password || ''} />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            {...register('confirmPassword')}
            className={inputClass}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={dobDay}
            onChange={(e) => setDobDay(e.target.value)}
            className={inputClass + ' appearance-none'}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
          <select
            value={dobMonth}
            onChange={(e) => setDobMonth(e.target.value)}
            className={inputClass + ' appearance-none'}
          >
            <option value="">Month</option>
            {MONTHS.map((month, i) => (
              <option key={month} value={String(i + 1)}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={dobYear}
            onChange={(e) => setDobYear(e.target.value)}
            className={inputClass + ' appearance-none'}
          >
            <option value="">Year</option>
            {Array.from({ length: 88 }, (_, i) => {
              const year = currentYear - 13 - i;
              return (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth.message}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Gender <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <select {...register('gender')} className={inputClass + ' appearance-none'}>
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Photo</label>
        <ImageUpload
          value={watch('profileImageUrl')}
          onChange={(dataUrl) => setValue('profileImageUrl', dataUrl)}
          shape="circle"
          error={errors.profileImageUrl?.message}
        />
      </div>
    </div>
  );
}
