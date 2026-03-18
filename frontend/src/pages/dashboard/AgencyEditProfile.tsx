import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Building2, MapPin, Target, Megaphone, Globe, Loader2,
  AlertCircle, ArrowLeft, Instagram, Youtube, Twitter, Facebook, Linkedin,
} from 'lucide-react';

import { agencyEditSchema, type AgencyEditFormData } from '../../schemas/agencyEditSchema';
import { getAgencyProfiles, updateAgencyProfile } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import type { AgencyProfile } from '../../types';
import {
  INDUSTRY_CATEGORIES, INDUSTRY_LABELS,
  COMPANY_SIZES, COMPANY_SIZE_LABELS,
  BUDGET_RANGES, BUDGET_RANGE_LABELS,
  PAYMENT_TYPES, PAYMENT_TYPE_LABELS,
  PAYMENT_TIMELINES, PAYMENT_TIMELINE_LABELS,
  FOLLOWER_RANGES, FOLLOWER_RANGE_LABELS,
  AGE_GROUPS, TARGET_GENDERS, TARGET_LOCATIONS, INCOME_BRACKETS,
  CAMPAIGNS_PER_MONTH,
  PREFERRED_PLATFORMS, PLATFORM_LABELS as AGENCY_PLATFORM_LABELS,
  CONTENT_TYPES_AGENCY, CONTENT_TYPE_LABELS as AGENCY_CONTENT_TYPE_LABELS,
} from '../../types/agency.types';
import { CREATOR_CATEGORIES, CATEGORY_LABELS, LANGUAGES } from '../../types/creator.types';

/* ────────────────────────────── helpers ────────────────────────────── */

function mapProfileToForm(p: AgencyProfile): AgencyEditFormData {
  return {
    contactPersonName: p.contact?.contactPersonName || '',
    contactEmail: p.contact?.contactEmail || '',
    contactPhone: p.contact?.contactPhone || '',
    designation: p.contact?.designation || '',
    linkedinUrl: p.contact?.linkedinUrl || '',
    brandName: p.brandName,
    companyLegalName: p.companyLegalName,
    website: p.website,
    logoUrl: p.logoUrl || '',
    industry: p.industry,
    companySize: p.companySize,
    yearFounded: p.yearFounded ?? undefined,
    gstin: p.gstin || '',
    description: p.description,
    brandSocials: {
      instagram: (p.brandSocials as Record<string, string>)?.instagram || '',
      youtube: (p.brandSocials as Record<string, string>)?.youtube || '',
      twitter: (p.brandSocials as Record<string, string>)?.twitter || '',
      facebook: (p.brandSocials as Record<string, string>)?.facebook || '',
      linkedin: (p.brandSocials as Record<string, string>)?.linkedin || '',
    },
    city: p.city,
    state: p.state,
    country: p.country,
    pinCode: p.pinCode || '',
    targetAgeGroups: p.targetAudience?.ageGroups || [],
    targetGenders: p.targetAudience?.genders || [],
    targetLocations: p.targetAudience?.locations || [],
    targetIncomeBracket: p.targetAudience?.incomeBracket || '',
    targetLanguages: p.targetAudience?.languages || [],
    preferredPlatforms: p.campaignPreferences?.platforms || [],
    contentTypesNeeded: p.campaignPreferences?.contentTypes || [],
    budgetRange: p.campaignPreferences?.budgetRange || '',
    paymentTypes: p.campaignPreferences?.paymentTypes || [],
    paymentTimeline: p.campaignPreferences?.paymentTimeline || '',
    campaignsPerMonth: p.campaignPreferences?.campaignsPerMonth || '',
    preferredFollowerRange: p.campaignPreferences?.preferredFollowerRange || [],
    preferredCreatorCategories: p.campaignPreferences?.preferredCreatorCategories || [],
  };
}

function buildPayload(data: AgencyEditFormData) {
  return {
    brandName: data.brandName,
    companyLegalName: data.companyLegalName,
    website: data.website,
    logoUrl: data.logoUrl || undefined,
    industry: data.industry,
    companySize: data.companySize,
    yearFounded: data.yearFounded || undefined,
    gstin: data.gstin || undefined,
    description: data.description,
    brandSocials: data.brandSocials,
    city: data.city,
    state: data.state,
    country: data.country,
    pinCode: data.pinCode || undefined,
    contact: {
      contactPersonName: data.contactPersonName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || undefined,
      designation: data.designation,
      linkedinUrl: data.linkedinUrl || undefined,
    },
    targetAudience: {
      ageGroups: data.targetAgeGroups,
      genders: data.targetGenders,
      locations: data.targetLocations,
      incomeBracket: data.targetIncomeBracket || undefined,
      languages: data.targetLanguages,
    },
    campaignPreferences: {
      platforms: data.preferredPlatforms,
      contentTypes: data.contentTypesNeeded,
      budgetRange: data.budgetRange,
      paymentTypes: data.paymentTypes,
      paymentTimeline: data.paymentTimeline,
      campaignsPerMonth: data.campaignsPerMonth || undefined,
      preferredFollowerRange: data.preferredFollowerRange,
      preferredCreatorCategories: data.preferredCreatorCategories,
    },
  };
}

/* ────────────────────────────── reusable bits ──────────────────────── */

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors';

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1">{message}</p>;
}

function CheckboxGroup({
  options,
  labels,
  value,
  onChange,
  max,
}: {
  options: readonly string[];
  labels?: Record<string, string>;
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, item]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              selected
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08]'
            }`}
          >
            {labels ? labels[opt] ?? opt : opt}
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────── component ──────────────────────────── */

export function AgencyEditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading, isError } = useQuery({
    queryKey: ['agencies'],
    queryFn: getAgencyProfiles,
  });

  const profile = profiles?.find((p) => p.userId === user?.id);

  const form = useForm<AgencyEditFormData>({
    resolver: zodResolver(agencyEditSchema),
    defaultValues: {},
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (profile) {
      reset(mapProfileToForm(profile));
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (data: AgencyEditFormData) =>
      updateAgencyProfile(profile!.id, buildPayload(data) as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Profile updated successfully!');
      navigate('/dashboard/agency');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });

  const onSubmit = (data: AgencyEditFormData) => mutation.mutate(data);

  /* ── loading / error states ── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-400">{isError ? 'Failed to load profile.' : 'Agency profile not found.'}</p>
        <button
          onClick={() => navigate('/dashboard/agency')}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  /* ── form ── */

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Edit Agency Profile</h1>
          <button
            type="button"
            onClick={() => navigate('/dashboard/agency')}
            className="flex items-center gap-1 text-sm border border-white/20 text-white hover:bg-white/10 rounded-xl px-3 py-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── 1. Contact Person ── */}
          <SectionCard title="Contact Person" icon={<User className="w-5 h-5 text-indigo-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Name *</label>
                <input {...register('contactPersonName')} className={inputCls} />
                <FieldError message={errors.contactPersonName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email *</label>
                <input {...register('contactEmail')} type="email" className={inputCls} />
                <FieldError message={errors.contactEmail?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input {...register('contactPhone')} className={inputCls} />
                <FieldError message={errors.contactPhone?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Designation *</label>
                <input {...register('designation')} className={inputCls} />
                <FieldError message={errors.designation?.message} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn URL</label>
                <input {...register('linkedinUrl')} className={inputCls} placeholder="https://linkedin.com/in/..." />
                <FieldError message={errors.linkedinUrl?.message} />
              </div>
            </div>
          </SectionCard>

          {/* ── 2. Brand Details ── */}
          <SectionCard title="Brand Details" icon={<Building2 className="w-5 h-5 text-indigo-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Brand Name *</label>
                <input {...register('brandName')} className={inputCls} />
                <FieldError message={errors.brandName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Legal Name *</label>
                <input {...register('companyLegalName')} className={inputCls} />
                <FieldError message={errors.companyLegalName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Website *</label>
                <input {...register('website')} className={inputCls} placeholder="https://..." />
                <FieldError message={errors.website?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL</label>
                <input {...register('logoUrl')} className={inputCls} placeholder="https://..." />
                <FieldError message={errors.logoUrl?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Industry *</label>
                <select {...register('industry')} className={`${inputCls} appearance-none`}>
                  <option value="">Select industry</option>
                  {INDUSTRY_CATEGORIES.map((k) => (
                    <option key={k} value={k}>{INDUSTRY_LABELS[k]}</option>
                  ))}
                </select>
                <FieldError message={errors.industry?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Size *</label>
                <select {...register('companySize')} className={`${inputCls} appearance-none`}>
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((k) => (
                    <option key={k} value={k}>{COMPANY_SIZE_LABELS[k]}</option>
                  ))}
                </select>
                <FieldError message={errors.companySize?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Year Founded</label>
                <input {...register('yearFounded')} type="number" className={inputCls} placeholder="e.g. 2018" />
                <FieldError message={errors.yearFounded?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">GSTIN</label>
                <input {...register('gstin')} className={inputCls} />
                <FieldError message={errors.gstin?.message} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                <textarea {...register('description')} rows={4} className={`${inputCls} min-h-[80px] resize-vertical`} />
                <FieldError message={errors.description?.message} />
              </div>
            </div>
          </SectionCard>

          {/* ── 3. Brand Socials ── */}
          <SectionCard title="Brand Socials" icon={<Globe className="w-5 h-5 text-indigo-400" />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-pink-500 shrink-0" />
                <input {...register('brandSocials.instagram')} className={inputCls} placeholder="Instagram URL" />
              </div>
              <div className="flex items-center gap-3">
                <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                <input {...register('brandSocials.youtube')} className={inputCls} placeholder="YouTube URL" />
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="w-5 h-5 text-sky-500 shrink-0" />
                <input {...register('brandSocials.twitter')} className={inputCls} placeholder="Twitter / X URL" />
              </div>
              <div className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-blue-600 shrink-0" />
                <input {...register('brandSocials.facebook')} className={inputCls} placeholder="Facebook URL" />
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-blue-700 shrink-0" />
                <input {...register('brandSocials.linkedin')} className={inputCls} placeholder="LinkedIn URL" />
              </div>
            </div>
            {errors.brandSocials && (
              <p className="text-red-400 text-xs mt-2">Please check the social URLs above.</p>
            )}
          </SectionCard>

          {/* ── 4. Location ── */}
          <SectionCard title="Location" icon={<MapPin className="w-5 h-5 text-indigo-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">City *</label>
                <input {...register('city')} className={inputCls} />
                <FieldError message={errors.city?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">State *</label>
                <input {...register('state')} className={inputCls} />
                <FieldError message={errors.state?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Country *</label>
                <input {...register('country')} className={inputCls} />
                <FieldError message={errors.country?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">PIN Code</label>
                <input {...register('pinCode')} className={inputCls} />
                <FieldError message={errors.pinCode?.message} />
              </div>
            </div>
          </SectionCard>

          {/* ── 5. Target Audience ── */}
          <SectionCard title="Target Audience" icon={<Target className="w-5 h-5 text-indigo-400" />}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Age Groups *</label>
                <Controller
                  name="targetAgeGroups"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup options={AGE_GROUPS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError message={errors.targetAgeGroups?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Genders *</label>
                <Controller
                  name="targetGenders"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup options={TARGET_GENDERS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError message={errors.targetGenders?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Locations *</label>
                <Controller
                  name="targetLocations"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup options={TARGET_LOCATIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError message={errors.targetLocations?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Income Bracket</label>
                <select {...register('targetIncomeBracket')} className={`${inputCls} appearance-none`}>
                  <option value="">Select income bracket</option>
                  {INCOME_BRACKETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Languages *</label>
                <Controller
                  name="targetLanguages"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup options={LANGUAGES} value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError message={errors.targetLanguages?.message} />
              </div>
            </div>
          </SectionCard>

          {/* ── 6. Campaign Preferences ── */}
          <SectionCard title="Campaign Preferences" icon={<Megaphone className="w-5 h-5 text-indigo-400" />}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Platforms *</label>
                <Controller
                  name="preferredPlatforms"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      options={PREFERRED_PLATFORMS}
                      labels={AGENCY_PLATFORM_LABELS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError message={errors.preferredPlatforms?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Content Types *</label>
                <Controller
                  name="contentTypesNeeded"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      options={CONTENT_TYPES_AGENCY}
                      labels={AGENCY_CONTENT_TYPE_LABELS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError message={errors.contentTypesNeeded?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Budget Range *</label>
                <select {...register('budgetRange')} className={`${inputCls} appearance-none`}>
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((k) => (
                    <option key={k} value={k}>{BUDGET_RANGE_LABELS[k]}</option>
                  ))}
                </select>
                <FieldError message={errors.budgetRange?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Payment Types *</label>
                <Controller
                  name="paymentTypes"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      options={PAYMENT_TYPES}
                      labels={PAYMENT_TYPE_LABELS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError message={errors.paymentTypes?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Timeline *</label>
                <select {...register('paymentTimeline')} className={`${inputCls} appearance-none`}>
                  <option value="">Select timeline</option>
                  {PAYMENT_TIMELINES.map((k) => (
                    <option key={k} value={k}>{PAYMENT_TIMELINE_LABELS[k]}</option>
                  ))}
                </select>
                <FieldError message={errors.paymentTimeline?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Campaigns per Month</label>
                <select {...register('campaignsPerMonth')} className={`${inputCls} appearance-none`}>
                  <option value="">Select frequency</option>
                  {CAMPAIGNS_PER_MONTH.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Follower Range *</label>
                <Controller
                  name="preferredFollowerRange"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      options={FOLLOWER_RANGES}
                      labels={FOLLOWER_RANGE_LABELS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FieldError message={errors.preferredFollowerRange?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Preferred Creator Categories * <span className="text-gray-500 font-normal">(max 5)</span>
                </label>
                <Controller
                  name="preferredCreatorCategories"
                  control={control}
                  render={({ field }) => (
                    <CheckboxGroup
                      options={CREATOR_CATEGORIES}
                      labels={CATEGORY_LABELS}
                      value={field.value}
                      onChange={field.onChange}
                      max={5}
                    />
                  )}
                />
                <FieldError message={errors.preferredCreatorCategories?.message} />
              </div>
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(isSubmitting || mutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting || mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
