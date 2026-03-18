import type { UseFormReturn } from 'react-hook-form';
import type { CreatorFormData, CreatorCategory } from '../../../../types/creator.types';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  LANGUAGES,
} from '../../../../types/creator.types';
import { CategorySelector } from '../shared/CategorySelector';
import { ChipMultiSelect } from '../shared/ChipMultiSelect';

interface ProfileCategoriesStepProps {
  form: UseFormReturn<CreatorFormData>;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors';

export function ProfileCategoriesStep({ form }: ProfileCategoriesStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const categories = watch('categories') || [];
  const languages = watch('languages') || [];
  const contentTypes = watch('contentTypes') || [];
  const bio = watch('bio') || '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">What kind of content do you create?</h2>
        <p className="text-gray-400 mt-1">Select your niche -- you can choose up to 3 categories</p>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Categories</label>
        <CategorySelector
          selected={categories as string[]}
          onChange={(selected) => setValue('categories', selected as CreatorCategory[], { shouldValidate: true })}
          maxSelections={3}
          error={errors.categories?.message}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Tell brands what makes you unique..."
          className={inputClass + ' resize-none'}
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-sm text-red-400">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${bio.length < 50 || bio.length > 500 ? 'text-red-400' : 'text-gray-500'}`}>
            {bio.length}/500
          </span>
        </div>
      </div>

      {/* Content Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Content Languages</label>
        <ChipMultiSelect
          items={LANGUAGES}
          selected={languages}
          onChange={(selected) => setValue('languages', selected, { shouldValidate: true })}
          error={errors.languages?.message}
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
          <input
            type="text"
            placeholder="Mumbai"
            {...register('city')}
            className={inputClass}
          />
          {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
          <input
            type="text"
            placeholder="Maharashtra"
            {...register('state')}
            className={inputClass}
          />
          {errors.state && <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
          <input
            type="text"
            {...register('country')}
            className={inputClass}
          />
          {errors.country && <p className="mt-1 text-sm text-red-400">{errors.country.message}</p>}
        </div>
      </div>

      {/* Content Type Specialty */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Content Type Specialty</label>
        <ChipMultiSelect
          items={CONTENT_TYPES}
          labels={CONTENT_TYPE_LABELS as Record<string, string>}
          selected={contentTypes}
          onChange={(selected) => setValue('contentTypes', selected, { shouldValidate: true })}
          maxSelections={5}
          error={errors.contentTypes?.message}
        />
      </div>

      {/* Portfolio URL */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Portfolio URL <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://yourportfolio.com"
          {...register('portfolioUrl')}
          className={inputClass}
        />
        {errors.portfolioUrl && <p className="mt-1 text-sm text-red-400">{errors.portfolioUrl.message}</p>}
      </div>
    </div>
  );
}
