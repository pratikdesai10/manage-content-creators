export type UserRole = "CREATOR" | "AGENCY"

export interface User {
	id: string
	email: string
	role: UserRole
	isVerified: boolean
	createdAt: string
}

export interface SocialAccount {
	id: string
	creatorProfileId: string
	platform: string
	handle: string
	profileUrl: string | null
	followerCount: number
	isVerified: boolean
	accountType: string | null
	engagementRate: number
	avgLikes: number
	growthPercent: number
	topContentType: string | null
}

export interface CreatorProfile {
	id: string
	userId: string
	firstName: string
	lastName: string
	displayName: string
	dateOfBirth: string
	gender: string | null
	profileImageUrl: string | null
	bio: string
	languages: string[]
	city: string
	state: string
	country: string
	categories: string[]
	contentTypes: string[]
	portfolioUrl: string | null
	rateRange: string
	collaborationTypes: string[]
	availability: string
	willingToTravel: boolean
	travelScope: string | null
	previousCollaborations: number | null
	notableBrands: string[]
	marketingEmails: boolean
	whatsappNotifications: boolean
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
