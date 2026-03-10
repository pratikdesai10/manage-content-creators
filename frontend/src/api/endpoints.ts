import apiClient from './axios';
import type { CreatorFormData } from '../types/creator.types';
import type { AgencyFormData } from '../types/agency.types';
import type { AuthResponse, CreatorProfile } from '../types';

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<{ data: { accessToken: string; user: AuthResponse['user'] } }>('/auth/login', { email, password });
  return { access_token: data.data.accessToken, user: data.data.user };
}

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
  return data;
}

export async function checkEmail(email: string): Promise<{ available: boolean }> {
  const { data } = await apiClient.get(`/auth/check-email/${encodeURIComponent(email)}`);
  return data;
}

export interface DashboardStats {
  profileViews: number;
  collaborationCount: number;
  messageCount: number;
}

export interface Collaboration {
  id: string;
  brandName: string;
  brandLogo: string | null;
  type: string;
  status: string;
  createdAt: string;
}

export interface DashboardMessage {
  id: string;
  brandName: string;
  preview: string;
  isRead: boolean;
  createdAt: string;
}

export async function getCreatorProfiles(): Promise<CreatorProfile[]> {
  const { data } = await apiClient.get<{ data: CreatorProfile[] }>('/creators');
  return data.data;
}

export async function getCreatorStats(creatorId: string): Promise<DashboardStats> {
  const { data } = await apiClient.get<{ data: DashboardStats }>(`/creators/${creatorId}/stats`);
  return data.data;
}

export async function getRecentCollaborations(creatorId: string): Promise<Collaboration[]> {
  const { data } = await apiClient.get<{ data: Collaboration[] }>(`/creators/${creatorId}/collaborations`);
  return data.data;
}

export async function getRecentMessages(creatorId: string): Promise<DashboardMessage[]> {
  const { data } = await apiClient.get<{ data: DashboardMessage[] }>(`/creators/${creatorId}/messages`);
  return data.data;
}

export interface CollaborationDetail extends Collaboration {
  brief: string | null;
  deliverables: string[];
  timeline: string | null;
  budget: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
}

export interface MessageThreadEntry {
  id: string;
  sender: 'BRAND' | 'CREATOR';
  text: string;
  sentAt: string;
}

export interface MessageWithThread extends DashboardMessage {
  threads: MessageThreadEntry[];
}

export interface SocialAccountDetail {
  id: string;
  platform: string;
  handle: string;
  followerCount: number;
  engagementRate: number;
  avgLikes: number;
  growthPercent: number;
  topContentType: string | null;
}

export async function getCollaborationDetail(creatorId: string, collabId: string): Promise<CollaborationDetail> {
  const { data } = await apiClient.get<{ data: CollaborationDetail }>(
    `/creators/${creatorId}/collaborations/${collabId}`
  );
  return data.data;
}

export async function getMessageThread(creatorId: string, messageId: string): Promise<MessageWithThread> {
  const { data } = await apiClient.get<{ data: MessageWithThread }>(
    `/creators/${creatorId}/messages/${messageId}/thread`
  );
  return data.data;
}

export async function getSocialAccountDetail(creatorId: string, accountId: string): Promise<SocialAccountDetail> {
  const { data } = await apiClient.get<{ data: SocialAccountDetail }>(
    `/creators/${creatorId}/social-accounts/${accountId}`
  );
  return data.data;
}
