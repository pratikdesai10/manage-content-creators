import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AgencyFormData } from '../../../../types/agency.types';
import { PasswordStrengthMeter } from '../shared/PasswordStrengthMeter';
import { PhoneInput } from '../shared/PhoneInput';
import { checkEmail } from '../../../../api/endpoints';

interface AccountManagerStepProps {
  form: UseFormReturn<AgencyFormData>;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors';

export function AccountManagerStep({ form }: AccountManagerStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    setError,
  } = form;

  const password = watch('password');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  async function handleEmailBlur() {
    const email = form.getValues('workEmail');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailStatus('checking');
    try {
      const result = await checkEmail(email);
      setEmailStatus(result.available ? 'available' : 'taken');
      if (!result.available) {
        setError('workEmail', { message: 'Email is already registered' });
      }
    } catch {
      setEmailStatus('idle');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Who's managing this account?</h2>
        <p className="text-gray-400 mt-1">We need details of the person handling brand collaborations</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
        <input
          type="text"
          placeholder="Jane Doe"
          {...register('fullName')}
          className={inputClass}
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>}
      </div>

      {/* Work Email */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Work Email</label>
        <div className="relative">
          <input
            type="email"
            placeholder="jane@company.com"
            {...register('workEmail')}
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
        <p className="mt-1 text-xs text-gray-500">Use your company email for faster verification</p>
        {errors.workEmail && <p className="mt-1 text-sm text-red-400">{errors.workEmail.message}</p>}
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

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
        <PhoneInput
          value={watch('phone')}
          onChange={(val) => setValue('phone', val)}
          error={errors.phone?.message}
        />
      </div>

      {/* Designation / Role */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Designation / Role</label>
        <input
          type="text"
          placeholder="e.g., Marketing Manager, Brand Head"
          {...register('designation')}
          className={inputClass}
        />
        {errors.designation && <p className="mt-1 text-sm text-red-400">{errors.designation.message}</p>}
      </div>

      {/* LinkedIn Profile */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          LinkedIn Profile <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          {...register('linkedinUrl')}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Helps creators trust your brand</p>
        {errors.linkedinUrl && <p className="mt-1 text-sm text-red-400">{errors.linkedinUrl.message}</p>}
      </div>
    </div>
  );
}
