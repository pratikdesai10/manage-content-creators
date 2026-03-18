import type { UseFormReturn } from 'react-hook-form';
import type { CreatorFormData, CreatorCategory } from '../../../../types/creator.types';
import { CATEGORY_LABELS, CATEGORY_ICONS, PLATFORM_LABELS } from '../../../../types/creator.types';
import { TermsAccordion } from '../shared/TermsAccordion';
import { TermsCheckboxGroup } from '../shared/TermsCheckboxGroup';

interface CreatorReviewStepProps {
  form: UseFormReturn<CreatorFormData>;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

const TERMS_ITEMS = [
  { name: 'termsOfService', label: 'I agree to the Terms of Service and Privacy Policy', required: true },
  { name: 'contentGuidelines', label: "I agree to follow CollabHub's Content & Community Guidelines", required: true },
  { name: 'ageConfirmation', label: 'I confirm that I am at least 13 years of age', required: true },
  { name: 'dataAccuracy', label: 'I confirm that all information provided is accurate and the social media accounts belong to me', required: true },
  { name: 'marketingEmails', label: "I'd like to receive campaign opportunities and updates via email", required: false },
  { name: 'whatsappNotifications', label: "I'd like to receive notifications via WhatsApp", required: false },
];

const CREATOR_TERMS_SUMMARY = `By creating an account on CollabHub, you agree to our Terms of Service and Privacy Policy. As a creator, you confirm that:

- All information and social media accounts provided are accurate and belong to you.
- You will follow our Content & Community Guidelines and maintain professional conduct.
- You are at least 13 years of age.
- CollabHub may verify your identity and social media accounts.
- You grant CollabHub permission to display your public profile to brands and agencies on the platform.
- You may delete your account at any time, subject to any ongoing contractual obligations.`;

export function CreatorReviewStep({ form }: CreatorReviewStepProps) {
  const values = form.watch();

  const totalFollowers = (values.socialAccounts || []).reduce(
    (sum, acc) => sum + (Number(acc.followerCount) || 0),
    0,
  );

  // Find top platform by follower count
  const topAccount = [...(values.socialAccounts || [])].sort(
    (a, b) => (Number(b.followerCount) || 0) - (Number(a.followerCount) || 0),
  )[0];

  const bioSnippet = values.bio
    ? values.bio.length > 100
      ? values.bio.slice(0, 100) + '...'
      : values.bio
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Almost there! Review & accept</h2>
        <p className="text-gray-400 mt-1">Double-check your details before creating your account.</p>
      </div>

      {/* Profile Preview Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-start gap-4">
          {/* Profile image */}
          {values.profileImageUrl ? (
            <img
              src={values.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
              {(values.firstName?.[0] || '').toUpperCase()}
              {(values.lastName?.[0] || '').toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white">
              {values.firstName} {values.lastName}
            </h3>
            {values.displayName && (
              <p className="text-sm text-gray-400">@{values.displayName}</p>
            )}
          </div>

          <button
            type="button"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Edit
          </button>
        </div>

        {/* Categories */}
        {values.categories && values.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs font-medium"
              >
                {CATEGORY_ICONS[cat as CreatorCategory]} {CATEGORY_LABELS[cat as CreatorCategory]}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          {totalFollowers > 0 && (
            <div>
              <span className="font-semibold text-white">{formatFollowers(totalFollowers)}</span>{' '}
              total followers
            </div>
          )}
          {topAccount && topAccount.platform && (
            <div>
              Top platform:{' '}
              <span className="font-semibold text-white">
                {PLATFORM_LABELS[topAccount.platform as keyof typeof PLATFORM_LABELS] || topAccount.platform}
              </span>
            </div>
          )}
        </div>

        {/* Bio snippet */}
        {bioSnippet && (
          <p className="text-sm text-gray-400 italic">"{bioSnippet}"</p>
        )}
      </div>

      {/* Terms */}
      <TermsAccordion
        title="Creator Terms & Conditions"
        content={CREATOR_TERMS_SUMMARY}
      />

      {/* Checkboxes */}
      <TermsCheckboxGroup items={TERMS_ITEMS} form={form} />
    </div>
  );
}
