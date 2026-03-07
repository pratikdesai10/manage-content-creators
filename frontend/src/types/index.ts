export type UserRole = 'CREATOR' | 'AGENCY';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followersCount: number;
  creatorId: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  niche: string[];
  location: string | null;
  availability: string | null;
  rateRange: string | null;
  socialAccounts: SocialAccount[];
  user: User;
}

export interface AgencyProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string | null;
  website: string | null;
  location: string | null;
  user: User;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
