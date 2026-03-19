import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

import { creatorEditSchema, type CreatorEditFormData } from '../../schemas/creatorEditSchema';
import { getCreatorProfiles, updateCreatorProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import type { CreatorProfile } from '../../types';
import {
  CREATOR_CATEGORIES,
  CATEGORY_LABELS,
  SOCIAL_PLATFORMS,
  PLATFORM_LABELS,
  RATE_RANGES,
  RATE_RANGE_LABELS,
  AVAILABILITY_OPTIONS,
  AVAILABILITY_LABELS,
  COLLABORATION_TYPES,
  COLLABORATION_TYPE_LABELS,
  TRAVEL_SCOPES,
  TRAVEL_SCOPE_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  LANGUAGES,
} from '../../types/creator.types';

function mapProfileToForm(p: CreatorProfile): CreatorEditFormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    bio: p.bio,
    profileImageUrl: p.profileImageUrl || '',
    socialAccounts: p.socialAccounts.map((s) => ({
      platform: s.platform,
      profileUrl: s.profileUrl || '',
      handle: s.handle,
      followerCount: s.followerCount,
      accountType: s.accountType || '',
    })),
    categories: p.categories,
    languages: p.languages,
    city: p.city,
    state: p.state,
    country: p.country,
    contentTypes: p.contentTypes,
    portfolioUrl: p.portfolioUrl || '',
    rateRange: p.rateRange,
    collaborationTypes: p.collaborationTypes,
    availability: p.availability,
    willingToTravel: p.willingToTravel,
    travelScope: p.travelScope || '',
    previousCollaborations: p.previousCollaborations ?? undefined,
    notableBrands: p.notableBrands,
  };
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-gray-400 mb-1';
const errorClass = 'text-xs text-red-400 mt-1';

export function CreatorEditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading, isError } = useQuery({
    queryKey: ['creators'],
    queryFn: getCreatorProfiles,
  });

  const profile = profiles?.find((p) => p.userId === user?.id);

  const form = useForm<CreatorEditFormData>({
    resolver: zodResolver(creatorEditSchema),
    defaultValues: {
      socialAccounts: [{ platform: '', handle: '', profileUrl: '', followerCount: 0, accountType: '' }],
      categories: [],
      languages: [],
      contentTypes: [],
      collaborationTypes: [],
      notableBrands: [],
      willingToTravel: false,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialAccounts',
  });

  useEffect(() => {
    if (profile) {
      reset(mapProfileToForm(profile));
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreatorEditFormData) =>
      updateCreatorProfile(profile!.id, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
      toast.success('Profile updated successfully!');
      navigate('/dashboard/creator');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });

  const onSubmit = (data: CreatorEditFormData) => {
    mutation.mutate(data);
  };

  // Checkbox array helpers
  const watchCategories = watch('categories') || [];
  const watchLanguages = watch('languages') || [];
  const watchContentTypes = watch('contentTypes') || [];
  const watchCollabTypes = watch('collaborationTypes') || [];

  function toggleArrayValue(field: 'categories' | 'languages' | 'contentTypes' | 'collaborationTypes', value: string, max?: number) {
    const current = watch(field) as string[];
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value), { shouldValidate: true });
    } else {
      if (max && current.length >= max) return;
      setValue(field, [...current, value], { shouldValidate: true });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || (!isLoading && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400 text-lg">
          {isError ? 'Error loading profile. Please try again.' : 'Creator profile not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard/creator')}
          className="px-4 py-2 text-sm font-medium border border-white/20 text-white hover:bg-white/10 rounded-xl transition"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1: Personal Info */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Info</h2>
          <hr className="mb-4 border-white/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input {...register('firstName')} className={inputClass} />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input {...register('lastName')} className={inputClass} />
              {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Bio</label>
            <textarea {...register('bio')} rows={4} className={`${inputClass} min-h-[80px] resize-vertical`} />
            {errors.bio && <p className={errorClass}>{errors.bio.message}</p>}
          </div>
          <div className="mt-4">
            <label className={labelClass}>Profile Image URL</label>
            <input {...register('profileImageUrl')} className={inputClass} placeholder="https://..." />
            {errors.profileImageUrl && <p className={errorClass}>{errors.profileImageUrl.message}</p>}
          </div>
        </div>

        {/* Section 2: Social Accounts */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Social Accounts</h2>
          <hr className="mb-4 border-white/10" />
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
                <div>
                  <label className={labelClass}>Platform</label>
                  <select {...register(`socialAccounts.${index}.platform`)} className={`${inputClass} appearance-none`}>
                    <option value="">Select...</option>
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  {errors.socialAccounts?.[index]?.platform && (
                    <p className={errorClass}>{errors.socialAccounts[index]?.platform?.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Handle</label>
                  <input {...register(`socialAccounts.${index}.handle`)} className={inputClass} placeholder="@handle" />
                  {errors.socialAccounts?.[index]?.handle && (
                    <p className={errorClass}>{errors.socialAccounts[index]?.handle?.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Profile URL</label>
                  <input {...register(`socialAccounts.${index}.profileUrl`)} className={inputClass} placeholder="https://..." />
                  {errors.socialAccounts?.[index]?.profileUrl && (
                    <p className={errorClass}>{errors.socialAccounts[index]?.profileUrl?.message}</p>
                  )}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Followers</label>
                    <input
                      type="number"
                      {...register(`socialAccounts.${index}.followerCount`, { valueAsNumber: true })}
                      className={inputClass}
                      min={0}
                    />
                    {errors.socialAccounts?.[index]?.followerCount && (
                      <p className={errorClass}>{errors.socialAccounts[index]?.followerCount?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors mb-0.5"
                      title="Remove account"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {errors.socialAccounts?.message && (
            <p className={errorClass}>{errors.socialAccounts.message}</p>
          )}
          <button
            type="button"
            onClick={() => append({ platform: '', handle: '', profileUrl: '', followerCount: 0, accountType: '' })}
            className="flex items-center gap-1.5 text-sm border border-white/20 text-white hover:bg-white/10 rounded-xl px-3 py-1.5 font-medium mt-2 transition"
          >
            <Plus size={16} /> Add Social Account
          </button>
        </div>

        {/* Section 3: Categories & Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Categories & Content</h2>
          <hr className="mb-4 border-white/10" />

          {/* Categories */}
          <div className="mb-4">
            <label className={labelClass}>Categories (max 3)</label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleArrayValue('categories', cat, 3)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    watchCategories.includes(cat)
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                </button>
              ))}
            </div>
            {errors.categories && <p className={errorClass}>{errors.categories.message}</p>}
          </div>

          {/* Languages */}
          <div className="mb-4">
            <label className={labelClass}>Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayValue('languages', lang)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    watchLanguages.includes(lang)
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {errors.languages && <p className={errorClass}>{errors.languages.message}</p>}
          </div>

          {/* Content Types */}
          <div className="mb-4">
            <label className={labelClass}>Content Types</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => toggleArrayValue('contentTypes', ct)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    watchContentTypes.includes(ct)
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {CONTENT_TYPE_LABELS[ct as keyof typeof CONTENT_TYPE_LABELS]}
                </button>
              ))}
            </div>
            {errors.contentTypes && <p className={errorClass}>{errors.contentTypes.message}</p>}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input {...register('city')} className={inputClass} />
              {errors.city && <p className={errorClass}>{errors.city.message}</p>}
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input {...register('state')} className={inputClass} />
              {errors.state && <p className={errorClass}>{errors.state.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input {...register('country')} className={inputClass} />
              {errors.country && <p className={errorClass}>{errors.country.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: Collaboration */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Collaboration</h2>
          <hr className="mb-4 border-white/10" />

          {/* Rate Range */}
          <div className="mb-4">
            <label className={labelClass}>Rate Range</label>
            <select {...register('rateRange')} className={`${inputClass} appearance-none`}>
              <option value="">Select...</option>
              {RATE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {RATE_RANGE_LABELS[r]}
                </option>
              ))}
            </select>
            {errors.rateRange && <p className={errorClass}>{errors.rateRange.message}</p>}
          </div>

          {/* Collaboration Types */}
          <div className="mb-4">
            <label className={labelClass}>Collaboration Types</label>
            <div className="flex flex-wrap gap-2">
              {COLLABORATION_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => toggleArrayValue('collaborationTypes', ct)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    watchCollabTypes.includes(ct)
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]'
                  }`}
                >
                  {COLLABORATION_TYPE_LABELS[ct as keyof typeof COLLABORATION_TYPE_LABELS]}
                </button>
              ))}
            </div>
            {errors.collaborationTypes && <p className={errorClass}>{errors.collaborationTypes.message}</p>}
          </div>

          {/* Availability */}
          <div className="mb-4">
            <label className={labelClass}>Availability</label>
            <select {...register('availability')} className={`${inputClass} appearance-none`}>
              <option value="">Select...</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {AVAILABILITY_LABELS[a]}
                </option>
              ))}
            </select>
            {errors.availability && <p className={errorClass}>{errors.availability.message}</p>}
          </div>

          {/* Travel */}
          <div className="mb-4 flex items-center gap-3">
            <input type="checkbox" {...register('willingToTravel')} id="willingToTravel" className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/30" />
            <label htmlFor="willingToTravel" className="text-sm font-medium text-gray-300">
              Willing to Travel
            </label>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Travel Scope</label>
            <select {...register('travelScope')} className={`${inputClass} appearance-none`}>
              <option value="">Select...</option>
              {TRAVEL_SCOPES.map((ts) => (
                <option key={ts} value={ts}>
                  {TRAVEL_SCOPE_LABELS[ts]}
                </option>
              ))}
            </select>
            {errors.travelScope && <p className={errorClass}>{errors.travelScope.message}</p>}
          </div>

          {/* Previous Collaborations */}
          <div className="mb-4">
            <label className={labelClass}>Previous Collaborations</label>
            <input
              type="number"
              {...register('previousCollaborations', { valueAsNumber: true })}
              className={inputClass}
              min={0}
              placeholder="0"
            />
            {errors.previousCollaborations && <p className={errorClass}>{errors.previousCollaborations.message}</p>}
          </div>

          {/* Notable Brands */}
          <div className="mb-4">
            <label className={labelClass}>Notable Brands (comma-separated)</label>
            <input
              type="text"
              className={inputClass}
              value={(watch('notableBrands') || []).join(', ')}
              onChange={(e) => {
                const brands = e.target.value
                  .split(',')
                  .map((b) => b.trim())
                  .filter(Boolean);
                setValue('notableBrands', brands, { shouldValidate: true });
              }}
              placeholder="Brand A, Brand B, Brand C"
            />
          </div>

          {/* Portfolio URL */}
          <div>
            <label className={labelClass}>Portfolio URL</label>
            <input {...register('portfolioUrl')} className={inputClass} placeholder="https://..." />
            {errors.portfolioUrl && <p className={errorClass}>{errors.portfolioUrl.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
