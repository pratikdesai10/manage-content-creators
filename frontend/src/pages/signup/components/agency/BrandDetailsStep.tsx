import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AgencyFormData } from '../../../../types/agency.types';
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_LABELS,
  COMPANY_SIZES,
  COMPANY_SIZE_LABELS,
} from '../../../../types/agency.types';
import { ImageUpload } from '../shared/ImageUpload';

interface BrandDetailsStepProps {
  form: UseFormReturn<AgencyFormData>;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors';

export function BrandDetailsStep({ form }: BrandDetailsStepProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const description = watch('description') || '';
  const [socialsOpen, setSocialsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Tell us about your brand</h2>
        <p className="text-gray-400 mt-1">Help creators understand who you are</p>
      </div>

      {/* Brand Name + Company Legal Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Brand Name</label>
          <input
            type="text"
            placeholder="e.g., Acme Inc."
            {...register('brandName')}
            className={inputClass}
          />
          {errors.brandName && <p className="mt-1 text-sm text-red-400">{errors.brandName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Company Legal Name</label>
          <input
            type="text"
            placeholder="e.g., Acme Pvt. Ltd."
            {...register('companyLegalName')}
            className={inputClass}
          />
          {errors.companyLegalName && <p className="mt-1 text-sm text-red-400">{errors.companyLegalName.message}</p>}
        </div>
      </div>

      {/* Company Website */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Company Website</label>
        <input
          type="url"
          placeholder="https://www.acme.com"
          {...register('website')}
          className={inputClass}
        />
        {errors.website && <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>}
      </div>

      {/* Brand Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Brand Logo (400x400px recommended)</label>
        <ImageUpload
          value={watch('brandLogo')}
          onChange={(dataUrl) => setValue('brandLogo', dataUrl)}
          shape="square"
          error={errors.brandLogo?.message}
        />
      </div>

      {/* Industry / Category */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Industry / Category</label>
        <select {...register('industry')} className={inputClass + ' appearance-none'}>
          <option value="">Select industry</option>
          {INDUSTRY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {INDUSTRY_LABELS[cat]}
            </option>
          ))}
        </select>
        {errors.industry && <p className="mt-1 text-sm text-red-400">{errors.industry.message}</p>}
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Company Size</label>
        <select {...register('companySize')} className={inputClass + ' appearance-none'}>
          <option value="">Select company size</option>
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {COMPANY_SIZE_LABELS[size]}
            </option>
          ))}
        </select>
        {errors.companySize && <p className="mt-1 text-sm text-red-400">{errors.companySize.message}</p>}
      </div>

      {/* Year Founded */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Year Founded <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          placeholder="e.g., 2015"
          {...register('yearFounded', { valueAsNumber: true })}
          className={inputClass}
        />
        {errors.yearFounded && <p className="mt-1 text-sm text-red-400">{errors.yearFounded.message}</p>}
      </div>

      {/* GSTIN */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          GSTIN <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 22AAAAA0000A1Z5"
          {...register('gstin')}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">Required for Indian tax invoicing</p>
        {errors.gstin && <p className="mt-1 text-sm text-red-400">{errors.gstin.message}</p>}
      </div>

      {/* Brand Description */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Brand Description</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Tell creators about your brand, mission, and the kind of collaborations you're looking for..."
          className={inputClass + ' resize-none'}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-red-400">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${description.length < 50 || description.length > 500 ? 'text-red-400' : 'text-gray-500'}`}>
            {description.length}/500
          </span>
        </div>
      </div>

      {/* Brand Social Media -- collapsible */}
      <div className="border border-white/10 rounded-lg">
        <button
          type="button"
          onClick={() => setSocialsOpen(!socialsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition"
        >
          <span>Brand Social Media Links</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${socialsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {socialsOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 mt-3">Instagram</label>
              <input
                type="url"
                placeholder="https://instagram.com/yourbrand"
                {...register('brandSocials.instagram')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">YouTube</label>
              <input
                type="url"
                placeholder="https://youtube.com/@yourbrand"
                {...register('brandSocials.youtube')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Twitter / X</label>
              <input
                type="url"
                placeholder="https://x.com/yourbrand"
                {...register('brandSocials.twitter')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Facebook</label>
              <input
                type="url"
                placeholder="https://facebook.com/yourbrand"
                {...register('brandSocials.facebook')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/company/yourbrand"
                {...register('brandSocials.linkedin')}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
