import type { UseFormReturn } from 'react-hook-form';
import type { AgencyFormData } from '../../../../types/agency.types';
import {
  AGE_GROUPS,
  TARGET_GENDERS,
  TARGET_LOCATIONS,
  INCOME_BRACKETS,
} from '../../../../types/agency.types';
import { LANGUAGES } from '../../../../types/creator.types';
import { ChipMultiSelect } from '../shared/ChipMultiSelect';

interface LocationAudienceStepProps {
  form: UseFormReturn<AgencyFormData>;
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition';

export function LocationAudienceStep({ form }: LocationAudienceStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const targetAgeGroups = watch('targetAgeGroups') || [];
  const targetGenders = watch('targetGenders') || [];
  const targetLocations = watch('targetLocations') || [];
  const targetLanguages = watch('targetLanguages') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Where are you based and who do you target?</h2>
      </div>

      {/* Company Location */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              {...register('country')}
              className={inputClass}
            />
            {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              placeholder="e.g., Maharashtra"
              {...register('state')}
              className={inputClass}
            />
            {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              placeholder="e.g., Mumbai"
              {...register('city')}
              className={inputClass}
            />
            {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN / ZIP Code <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 400001"
              {...register('pinCode')}
              className={inputClass}
            />
            {errors.pinCode && <p className="mt-1 text-sm text-red-500">{errors.pinCode.message}</p>}
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Target Audience</h3>

        {/* Target Age Groups */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Age Group</label>
          <ChipMultiSelect
            items={AGE_GROUPS}
            selected={targetAgeGroups}
            onChange={(selected) => setValue('targetAgeGroups', selected, { shouldValidate: true })}
            error={errors.targetAgeGroups?.message}
          />
        </div>

        {/* Target Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Gender</label>
          <ChipMultiSelect
            items={TARGET_GENDERS}
            selected={targetGenders}
            onChange={(selected) => setValue('targetGenders', selected, { shouldValidate: true })}
            error={errors.targetGenders?.message}
          />
        </div>

        {/* Target Locations */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Locations</label>
          <ChipMultiSelect
            items={TARGET_LOCATIONS}
            selected={targetLocations}
            onChange={(selected) => setValue('targetLocations', selected, { shouldValidate: true })}
            error={errors.targetLocations?.message}
          />
        </div>

        {/* Target Income Bracket */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Income Bracket <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select {...register('targetIncomeBracket')} className={inputClass}>
            <option value="">Select income bracket</option>
            {INCOME_BRACKETS.map((bracket) => (
              <option key={bracket} value={bracket}>
                {bracket}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Language of Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Language of Audience</label>
          <ChipMultiSelect
            items={LANGUAGES}
            selected={targetLanguages}
            onChange={(selected) => setValue('targetLanguages', selected, { shouldValidate: true })}
            error={errors.targetLanguages?.message}
          />
        </div>
      </div>
    </div>
  );
}
