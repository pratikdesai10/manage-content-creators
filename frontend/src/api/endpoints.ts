import apiClient from './axios';
import type { CreatorFormData } from '../types/creator.types';
import type { AgencyFormData } from '../types/agency.types';

export async function registerCreator(data: CreatorFormData) {
  const { confirmPassword, termsOfService, contentGuidelines, ageConfirmation, dataAccuracy, ...payload } = data;
  // Clean up empty optional fields that would fail backend enum/url validation
  if (!payload.travelScope) delete payload.travelScope;
  if (!payload.portfolioUrl) delete payload.portfolioUrl;
  if (!payload.gender) delete payload.gender;
  if (!payload.profileImageUrl) delete payload.profileImageUrl;
  if (payload.previousCollaborations === undefined || payload.previousCollaborations === null) delete payload.previousCollaborations;
  const { data: result } = await apiClient.post('/auth/register/creator', payload);
  return result;
}

export async function registerAgency(data: AgencyFormData) {
  const {
    confirmPassword, termsOfService, brandGuidelines, paymentTerms,
    dataAccuracy, creatorCommunicationPolicy, brandLogo,
    targetAgeGroups, targetGenders, targetLocations, targetIncomeBracket, targetLanguages,
    preferredPlatforms, contentTypesNeeded, budgetRange, paymentTypes, paymentTimeline,
    campaignsPerMonth, preferredFollowerRange, preferredCreatorCategories,
    ...rest
  } = data;

  // Clean up empty optional URL fields that would fail backend @IsUrl validation
  if (!rest.linkedinUrl) delete rest.linkedinUrl;
  if (!rest.gstin) delete rest.gstin;
  if (!rest.pinCode) delete rest.pinCode;

  // Clean empty social URLs
  const brandSocials = rest.brandSocials;
  if (brandSocials) {
    if (!brandSocials.instagram) delete brandSocials.instagram;
    if (!brandSocials.youtube) delete brandSocials.youtube;
    if (!brandSocials.twitter) delete brandSocials.twitter;
    if (!brandSocials.facebook) delete brandSocials.facebook;
    if (!brandSocials.linkedin) delete brandSocials.linkedin;
    // If all socials removed, omit the whole object
    if (Object.keys(brandSocials).length === 0) delete rest.brandSocials;
  }

  const payload = {
    ...rest,
    targetAudience: {
      ageGroups: targetAgeGroups,
      genders: targetGenders,
      locations: targetLocations,
      incomeBracket: targetIncomeBracket,
      languages: targetLanguages,
    },
    campaignPreferences: {
      platforms: preferredPlatforms,
      contentTypes: contentTypesNeeded,
      budgetRange,
      paymentTypes,
      paymentTimeline,
      campaignsPerMonth: campaignsPerMonth || undefined,
      preferredFollowerRange,
      preferredCreatorCategories,
    },
    logoUrl: brandLogo || undefined,
  };

  const { data: result } = await apiClient.post('/auth/register/agency', payload);
  return result;
}

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
  return data;
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-email/${encodeURIComponent(email)}`);
  return data;
}
