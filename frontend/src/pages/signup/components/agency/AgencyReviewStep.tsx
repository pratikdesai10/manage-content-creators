import type { UseFormReturn } from 'react-hook-form';
import type { AgencyFormData } from '../../../../types/agency.types';
import {
  INDUSTRY_LABELS,
  INDUSTRY_CATEGORIES,
  BUDGET_RANGE_LABELS,
  BUDGET_RANGES,
  PLATFORM_LABELS,
} from '../../../../types/agency.types';
import { TermsAccordion } from '../shared/TermsAccordion';
import { TermsCheckboxGroup } from '../shared/TermsCheckboxGroup';

interface AgencyReviewStepProps {
  form: UseFormReturn<AgencyFormData>;
}

const TERMS_ITEMS = [
  { name: 'termsOfService', label: 'I agree to the Terms of Service and Privacy Policy', required: true },
  { name: 'brandGuidelines', label: "I agree to follow CollabHub's Brand Collaboration Guidelines", required: true },
  { name: 'paymentTerms', label: "I understand and agree to CollabHub's Payment & Refund Policy", required: true },
  { name: 'dataAccuracy', label: 'I confirm that I am authorized to represent this brand/company and that all information provided is accurate', required: true },
  { name: 'creatorCommunicationPolicy', label: 'I agree to communicate with creators respectfully and through the CollabHub platform', required: true },
  { name: 'marketingEmails', label: 'Send me updates on new creators, platform features, and tips', required: false },
];

const BRAND_TERMS_SUMMARY = `By creating a brand account on CollabHub, you agree to our Terms of Service and Privacy Policy. As a brand/agency, you confirm that:

- You are authorized to represent this brand/company and all provided information is accurate.
- You will follow CollabHub's Brand Collaboration Guidelines and communicate with creators professionally.
- You understand and agree to CollabHub's Payment & Refund Policy for all collaborations.
- CollabHub may verify your brand identity and company details.
- You grant CollabHub permission to display your brand profile to creators on the platform.
- You agree to make timely payments to creators as per agreed collaboration terms.
- You may delete your account at any time, subject to any ongoing contractual obligations.`;

export function AgencyReviewStep({ form }: AgencyReviewStepProps) {
  const values = form.watch();

  const industryLabel = INDUSTRY_CATEGORIES.includes(values.industry as typeof INDUSTRY_CATEGORIES[number])
    ? INDUSTRY_LABELS[values.industry as typeof INDUSTRY_CATEGORIES[number]]
    : values.industry;

  const budgetLabel = BUDGET_RANGES.includes(values.budgetRange as typeof BUDGET_RANGES[number])
    ? BUDGET_RANGE_LABELS[values.budgetRange as typeof BUDGET_RANGES[number]]
    : values.budgetRange;

  const locationParts = [values.city, values.state].filter(Boolean);
  const locationStr = locationParts.join(', ');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review and launch your brand on CollabHub</h2>
      </div>

      {/* Brand Profile Preview Card */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-purple-50/50 to-white space-y-4">
        <div className="flex items-start gap-4">
          {/* Brand Logo */}
          {values.brandLogo ? (
            <img
              src={values.brandLogo}
              alt="Brand Logo"
              className="w-16 h-16 rounded-lg object-cover border-2 border-purple-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
              {(values.brandName?.[0] || 'B').toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{values.brandName || 'Your Brand'}</h3>
            {industryLabel && (
              <p className="text-sm text-gray-500">{industryLabel}</p>
            )}
          </div>
        </div>

        {/* Location */}
        {locationStr && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{locationStr}</span>
          </div>
        )}

        {/* Target Audience summary */}
        {(values.targetAgeGroups?.length > 0 || values.targetLocations?.length > 0) && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Target Audience: </span>
            {values.targetAgeGroups?.length > 0 && (
              <span>Ages {values.targetAgeGroups.join(', ')}</span>
            )}
            {values.targetAgeGroups?.length > 0 && values.targetLocations?.length > 0 && (
              <span> &middot; </span>
            )}
            {values.targetLocations?.length > 0 && (
              <span>{values.targetLocations.join(', ')}</span>
            )}
          </div>
        )}

        {/* Budget Range */}
        {budgetLabel && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Budget: </span>
            <span>{budgetLabel}</span>
          </div>
        )}

        {/* Preferred Platforms */}
        {values.preferredPlatforms?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.preferredPlatforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
              >
                {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Terms */}
      <TermsAccordion
        title="Brand Terms & Conditions"
        content={BRAND_TERMS_SUMMARY}
      />

      {/* Checkboxes */}
      <TermsCheckboxGroup items={TERMS_ITEMS} form={form} />
    </div>
  );
}
