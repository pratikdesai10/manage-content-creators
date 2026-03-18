import type { UseFormReturn, FieldErrors } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { SOCIAL_PLATFORMS, PLATFORM_LABELS, type SocialPlatform } from '../../../../types/creator.types';

interface SocialAccountEntryProps {
  index: number;
  form: UseFormReturn<any>;
  onRemove: () => void;
  canRemove: boolean;
  usedPlatforms: string[];
}

const darkInput =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors';

export function SocialAccountEntry({
  index,
  form,
  onRemove,
  canRemove,
  usedPlatforms,
}: SocialAccountEntryProps) {
  const { register, formState: { errors } } = form;

  // Safely access nested errors
  const accountErrors = (errors.socialAccounts as FieldErrors<Record<string, any>>[] | undefined)?.[index] as
    | Record<string, { message?: string }>
    | undefined;

  const currentPlatform = form.watch(`socialAccounts.${index}.platform`);

  return (
    <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-lg transition-colors',
          canRemove
            ? 'text-red-400 hover:text-red-300 hover:bg-white/5'
            : 'text-gray-600 cursor-not-allowed',
        )}
        aria-label="Remove social account"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
        {/* Platform dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Platform
          </label>
          <select
            {...register(`socialAccounts.${index}.platform`)}
            className={cn(
              darkInput,
              'appearance-none',
              accountErrors?.platform && 'border-red-400 focus:ring-red-400/30',
            )}
          >
            <option value="">Select platform</option>
            {SOCIAL_PLATFORMS.map((platform: SocialPlatform) => (
              <option
                key={platform}
                value={platform}
                disabled={
                  usedPlatforms.includes(platform) && platform !== currentPlatform
                }
              >
                {PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
          {accountErrors?.platform?.message && (
            <p className="mt-1 text-sm text-red-400">
              {accountErrors.platform.message}
            </p>
          )}
        </div>

        {/* Handle */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Handle
          </label>
          <input
            type="text"
            placeholder="@yourhandle"
            {...register(`socialAccounts.${index}.handle`)}
            className={cn(
              darkInput,
              accountErrors?.handle && 'border-red-400 focus:ring-red-400/30',
            )}
          />
          {accountErrors?.handle?.message && (
            <p className="mt-1 text-sm text-red-400">
              {accountErrors.handle.message}
            </p>
          )}
        </div>

        {/* Profile URL */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Profile URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            {...register(`socialAccounts.${index}.profileUrl`)}
            className={cn(
              darkInput,
              accountErrors?.profileUrl && 'border-red-400 focus:ring-red-400/30',
            )}
          />
          {accountErrors?.profileUrl?.message && (
            <p className="mt-1 text-sm text-red-400">
              {accountErrors.profileUrl.message}
            </p>
          )}
        </div>

        {/* Follower count */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Follower Count
          </label>
          <input
            type="number"
            placeholder="0"
            {...register(`socialAccounts.${index}.followerCount`, {
              setValueAs: (v: string) => (v === '' ? 0 : Number(v)),
            })}
            className={cn(
              darkInput,
              accountErrors?.followerCount && 'border-red-400 focus:ring-red-400/30',
            )}
          />
          {accountErrors?.followerCount?.message && (
            <p className="mt-1 text-sm text-red-400">
              {accountErrors.followerCount.message}
            </p>
          )}
        </div>

        {/* Account type (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Account Type{' '}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <select
            {...register(`socialAccounts.${index}.accountType`)}
            className={cn(darkInput, 'appearance-none')}
          >
            <option value="">Select type</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
            <option value="creator">Creator</option>
          </select>
        </div>
      </div>
    </div>
  );
}
