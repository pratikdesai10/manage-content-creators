export type UserRole = "CREATOR" | "AGENCY"

export interface User {
	id: string
	email: string
	role: UserRole
	createdAt: string
	updatedAt: string
}

export interface SocialAccount {
	id: string
	platform: string
	handle: string
	followerCount: number
	creatorId: string
}

export interface CreatorProfile {
	id: string
	userId: string
	displayName: string
	bio: string | null
	niche: string[]
	location: string | null
	availability: string | null
	rateRange: string | null
	socialAccounts: SocialAccount[]
	user: User
}

export interface AgencyProfile {
	id: string
	userId: string
	brandName: string
	companyLegalName: string
	industry: string
	companySize: string
	yearFounded: number | null
	gstin: string | null
	logoUrl: string | null
	website: string
	description: string
	brandSocials: Record<string, string> | null
	city: string
	state: string
	country: string
	pinCode: string | null
	targetAudience: {
		ageGroups: string[]
		genders: string[]
		locations: string[]
		incomeBracket?: string
		languages: string[]
	} | null
	campaignPreferences: {
		platforms: string[]
		contentTypes: string[]
		budgetRange: string
		paymentTypes: string[]
		paymentTimeline: string
		campaignsPerMonth?: string
		preferredFollowerRange: string[]
		preferredCreatorCategories: string[]
	} | null
	marketingEmails: boolean
	contact: {
		contactPersonName: string
		contactEmail: string
		contactPhone: string | null
		designation: string
		linkedinUrl: string | null
	} | null
	user: User
}

export interface AuthResponse {
	access_token: string
	user: User
}
