import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreatorFormData } from '../../../../types/creator.types';
import {
  RATE_RANGES,
  RATE_RANGE_LABELS,
  COLLABORATION_TYPES,
  COLLABORATION_TYPE_LABELS,
  AVAILABILITY_OPTIONS,
  AVAILABILITY_LABELS,
  TRAVEL_SCOPES,
  TRAVEL_SCOPE_LABELS,
} from '../../../../types/creator.types';
import { ChipMultiSelect } from '../shared/ChipMultiSelect';
import { cn } from '../../../../lib/utils';

interface CollaborationPrefsStepProps {
  form: UseFormReturn<CreatorFormData>;
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition';

export function CollaborationPrefsStep({ form }: CollaborationPrefsStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const collaborationTypes = watch('collaborationTypes') || [];
  const willingToTravel = watch('willingToTravel');
  const notableBrands = watch('notableBrands') || [];
  const [brandInput, setBrandInput] = useState('');

  function handleAddBrand(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = brandInput.trim();
      if (trimmed && !notableBrands.includes(trimmed)) {
        setValue('notableBrands', [...notableBrands, trimmed]);
      }
      setBrandInput('');
    }
  }

  function handleRemoveBrand(brand: string) {
    setValue(
      'notableBrands',
      notableBrands.filter((b) => b !== brand),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">How do you like to collaborate?</h2>
        <p className="text-gray-500 mt-1">Tell brands about your collaboration preferences and rates.</p>
      </div>

      {/* Rate Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Range (per collaboration)</label>
        <select {...register('rateRange')} className={inputClass}>
          <option value="">Select rate range</option>
          {RATE_RANGES.map((r) => (
            <option key={r} value={r}>
              {RATE_RANGE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.rateRange && <p className="mt-1 text-sm text-red-500">{errors.rateRange.message}</p>}
      </div>

      {/* Preferred Collaboration Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Collaboration Type</label>
        <ChipMultiSelect
          items={COLLABORATION_TYPES}
          labels={COLLABORATION_TYPE_LABELS as Record<string, string>}
          selected={collaborationTypes}
          onChange={(selected) => setValue('collaborationTypes', selected, { shouldValidate: true })}
          error={errors.collaborationTypes?.message}
        />
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
        <select {...register('availability')} className={inputClass}>
          <option value="">Select availability</option>
          {AVAILABILITY_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {AVAILABILITY_LABELS[a]}
            </option>
          ))}
        </select>
        {errors.availability && <p className="mt-1 text-sm text-red-500">{errors.availability.message}</p>}
      </div>

      {/* Willing to Travel */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              {...register('willingToTravel')}
              className="sr-only peer"
            />
            <div
              className={cn(
                'w-11 h-6 rounded-full transition-colors duration-200',
                willingToTravel ? 'bg-purple-600' : 'bg-gray-300',
              )}
            />
            <div
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                willingToTravel && 'translate-x-5',
              )}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Willing to Travel</span>
        </label>

        {willingToTravel && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Scope</label>
            <select {...register('travelScope')} className={inputClass}>
              <option value="">Select scope</option>
              {TRAVEL_SCOPES.map((t) => (
                <option key={t} value={t}>
                  {TRAVEL_SCOPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Previous Brand Collaborations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous Brand Collaborations <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          min={0}
          placeholder="e.g. 10"
          {...register('previousCollaborations', { valueAsNumber: true })}
          className={inputClass}
        />
      </div>

      {/* Notable Brands */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notable Brands You've Worked With
        </label>
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onKeyDown={handleAddBrand}
          placeholder="Type a brand name and press Enter"
          className={inputClass}
        />
        {notableBrands.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {notableBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
              >
                {brand}
                <button
                  type="button"
                  onClick={() => handleRemoveBrand(brand)}
                  className="ml-1 text-purple-400 hover:text-purple-700"
                  aria-label={`Remove ${brand}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
