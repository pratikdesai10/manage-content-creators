import type { UseFormReturn } from 'react-hook-form';
import type { AgencyFormData } from '../../../../types/agency.types';
import {
  PREFERRED_PLATFORMS,
  PLATFORM_LABELS,
  CONTENT_TYPES_AGENCY,
  CONTENT_TYPE_LABELS,
  BUDGET_RANGES,
  BUDGET_RANGE_LABELS,
  PAYMENT_TYPES,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TIMELINES,
  PAYMENT_TIMELINE_LABELS,
  CAMPAIGNS_PER_MONTH,
  FOLLOWER_RANGES,
  FOLLOWER_RANGE_LABELS,
} from '../../../../types/agency.types';
import { CREATOR_CATEGORIES, CATEGORY_LABELS } from '../../../../types/creator.types';
import { ChipMultiSelect } from '../shared/ChipMultiSelect';

interface CampaignPrefsStepProps {
  form: UseFormReturn<AgencyFormData>;
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition';

export function CampaignPrefsStep({ form }: CampaignPrefsStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const preferredPlatforms = watch('preferredPlatforms') || [];
  const contentTypesNeeded = watch('contentTypesNeeded') || [];
  const paymentTypes = watch('paymentTypes') || [];
  const preferredFollowerRange = watch('preferredFollowerRange') || [];
  const preferredCreatorCategories = watch('preferredCreatorCategories') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What kind of campaigns do you run?</h2>
      </div>

      {/* Content & Platform Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Content & Platform Preferences</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Platforms</label>
          <ChipMultiSelect
            items={PREFERRED_PLATFORMS}
            labels={PLATFORM_LABELS as Record<string, string>}
            selected={preferredPlatforms}
            onChange={(selected) => setValue('preferredPlatforms', selected, { shouldValidate: true })}
            error={errors.preferredPlatforms?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Types Needed</label>
          <ChipMultiSelect
            items={CONTENT_TYPES_AGENCY}
            labels={CONTENT_TYPE_LABELS as Record<string, string>}
            selected={contentTypesNeeded}
            onChange={(selected) => setValue('contentTypesNeeded', selected, { shouldValidate: true })}
            error={errors.contentTypesNeeded?.message}
          />
        </div>
      </div>

      {/* Budget & Payment */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget & Payment</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
          <select {...register('budgetRange')} className={inputClass}>
            <option value="">Select budget range</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {BUDGET_RANGE_LABELS[range]}
              </option>
            ))}
          </select>
          {errors.budgetRange && <p className="mt-1 text-sm text-red-500">{errors.budgetRange.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
          <ChipMultiSelect
            items={PAYMENT_TYPES}
            labels={PAYMENT_TYPE_LABELS as Record<string, string>}
            selected={paymentTypes}
            onChange={(selected) => setValue('paymentTypes', selected, { shouldValidate: true })}
            error={errors.paymentTypes?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Timeline</label>
          <select {...register('paymentTimeline')} className={inputClass}>
            <option value="">Select payment timeline</option>
            {PAYMENT_TIMELINES.map((timeline) => (
              <option key={timeline} value={timeline}>
                {PAYMENT_TIMELINE_LABELS[timeline]}
              </option>
            ))}
          </select>
          {errors.paymentTimeline && <p className="mt-1 text-sm text-red-500">{errors.paymentTimeline.message}</p>}
        </div>
      </div>

      {/* Campaign Frequency */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Campaign Frequency</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaigns Per Month <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select {...register('campaignsPerMonth')} className={inputClass}>
            <option value="">Select frequency</option>
            {CAMPAIGNS_PER_MONTH.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Creator Follower Range</label>
          <ChipMultiSelect
            items={FOLLOWER_RANGES}
            labels={FOLLOWER_RANGE_LABELS as Record<string, string>}
            selected={preferredFollowerRange}
            onChange={(selected) => setValue('preferredFollowerRange', selected, { shouldValidate: true })}
            error={errors.preferredFollowerRange?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Creator Categories <span className="text-gray-400 font-normal">(max 5)</span>
          </label>
          <ChipMultiSelect
            items={CREATOR_CATEGORIES}
            labels={CATEGORY_LABELS as Record<string, string>}
            selected={preferredCreatorCategories}
            onChange={(selected) => setValue('preferredCreatorCategories', selected, { shouldValidate: true })}
            maxSelections={5}
            error={errors.preferredCreatorCategories?.message}
          />
        </div>
      </div>
    </div>
  );
}
