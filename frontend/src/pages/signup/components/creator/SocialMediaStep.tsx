import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import type { CreatorFormData, SocialPlatform } from '../../../../types/creator.types';
import { SOCIAL_PLATFORMS } from '../../../../types/creator.types';
import { SocialAccountEntry } from '../shared/SocialAccountEntry';

interface SocialMediaStepProps {
  form: UseFormReturn<CreatorFormData>;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export function SocialMediaStep({ form }: SocialMediaStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialAccounts',
  });

  const { formState: { errors } } = form;

  const usedPlatforms = fields
    .map((f) => f.platform)
    .filter(Boolean) as string[];

  const allPlatformsUsed = usedPlatforms.length >= SOCIAL_PLATFORMS.length;

  const totalFollowers = fields.reduce((sum, _field, index) => {
    const count = form.watch(`socialAccounts.${index}.followerCount`);
    return sum + (Number(count) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect your social presence</h2>
        <p className="text-gray-500 mt-1">Add at least one social account to showcase your reach.</p>
      </div>

      {/* Total followers badge */}
      {totalFollowers > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
          <span>Total Followers:</span>
          <span className="font-bold">{formatFollowers(totalFollowers)}</span>
        </div>
      )}

      {/* Social account entries */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <SocialAccountEntry
            key={field.id}
            index={index}
            form={form}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            usedPlatforms={usedPlatforms}
          />
        ))}
      </div>

      {/* Add another button */}
      <button
        type="button"
        onClick={() =>
          append({
            platform: '' as SocialPlatform,
            profileUrl: '',
            handle: '',
            followerCount: 0,
          })
        }
        disabled={allPlatformsUsed}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-600 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add Another Social Account
      </button>

      {/* Array-level error */}
      {errors.socialAccounts && !Array.isArray(errors.socialAccounts) && (
        <p className="text-sm text-red-500">{errors.socialAccounts.message}</p>
      )}
      {errors.socialAccounts?.root && (
        <p className="text-sm text-red-500">{errors.socialAccounts.root.message}</p>
      )}
    </div>
  );
}
