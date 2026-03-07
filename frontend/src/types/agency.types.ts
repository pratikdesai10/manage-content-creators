export const INDUSTRY_CATEGORIES = [
  'FASHION_APPAREL', 'FOOD_BEVERAGE', 'TECHNOLOGY_ELECTRONICS',
  'FINANCE_FINTECH', 'TRAVEL_HOSPITALITY', 'BEAUTY_PERSONAL_CARE',
  'FITNESS_SPORTS', 'GAMING_ENTERTAINMENT', 'EDUCATION_EDTECH',
  'HEALTH_PHARMA', 'AUTOMOTIVE', 'REAL_ESTATE', 'D2C_ECOMMERCE', 'OTHER',
] as const;

export const INDUSTRY_LABELS: Record<typeof INDUSTRY_CATEGORIES[number], string> = {
  FASHION_APPAREL: 'Fashion & Apparel', FOOD_BEVERAGE: 'Food & Beverage',
  TECHNOLOGY_ELECTRONICS: 'Technology & Electronics', FINANCE_FINTECH: 'Finance & Fintech',
  TRAVEL_HOSPITALITY: 'Travel & Hospitality', BEAUTY_PERSONAL_CARE: 'Beauty & Personal Care',
  FITNESS_SPORTS: 'Fitness & Sports', GAMING_ENTERTAINMENT: 'Gaming & Entertainment',
  EDUCATION_EDTECH: 'Education & EdTech', HEALTH_PHARMA: 'Health & Pharma',
  AUTOMOTIVE: 'Automotive', REAL_ESTATE: 'Real Estate',
  D2C_ECOMMERCE: 'D2C / E-commerce', OTHER: 'Other',
};

export const COMPANY_SIZES = [
  'SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500_PLUS',
] as const;

export const COMPANY_SIZE_LABELS: Record<typeof COMPANY_SIZES[number], string> = {
  SIZE_1_10: '1-10', SIZE_11_50: '11-50', SIZE_51_200: '51-200',
  SIZE_201_500: '201-500', SIZE_500_PLUS: '500+',
};

export const BUDGET_RANGES = [
  'BUDGET_5K_20K', 'BUDGET_20K_1L', 'BUDGET_1L_5L', 'BUDGET_5L_PLUS', 'VARIES',
] as const;

export const BUDGET_RANGE_LABELS: Record<typeof BUDGET_RANGES[number], string> = {
  BUDGET_5K_20K: '₹5,000 – ₹20,000 per creator',
  BUDGET_20K_1L: '₹20,000 – ₹1,00,000 per creator',
  BUDGET_1L_5L: '₹1,00,000 – ₹5,00,000 per creator',
  BUDGET_5L_PLUS: '₹5,00,000+ per creator',
  VARIES: 'Varies by campaign',
};

export const PAYMENT_TYPES = [
  'FIXED', 'AFFILIATE', 'PRODUCT_EXCHANGE', 'HYBRID', 'PERFORMANCE_BASED',
] as const;

export const PAYMENT_TYPE_LABELS: Record<typeof PAYMENT_TYPES[number], string> = {
  FIXED: 'Fixed Payment', AFFILIATE: 'Affiliate / Commission-based',
  PRODUCT_EXCHANGE: 'Product Exchange / Barter',
  HYBRID: 'Hybrid (Fixed + Commission)', PERFORMANCE_BASED: 'Performance-based (CPV/CPE)',
};

export const PAYMENT_TIMELINES = [
  'UPFRONT', 'ON_DELIVERY', 'FIFTEEN_DAYS', 'THIRTY_DAYS', 'MILESTONE_BASED',
] as const;

export const PAYMENT_TIMELINE_LABELS: Record<typeof PAYMENT_TIMELINES[number], string> = {
  UPFRONT: 'Upfront (before content)', ON_DELIVERY: 'On delivery',
  FIFTEEN_DAYS: '15 days after delivery', THIRTY_DAYS: '30 days after delivery',
  MILESTONE_BASED: 'Milestone-based',
};

export const FOLLOWER_RANGES = [
  'NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA', 'ANY',
] as const;

export const FOLLOWER_RANGE_LABELS: Record<typeof FOLLOWER_RANGES[number], string> = {
  NANO: 'Nano (1K-10K)', MICRO: 'Micro (10K-50K)',
  MID_TIER: 'Mid-tier (50K-500K)', MACRO: 'Macro (500K-1M)',
  MEGA: 'Mega (1M+)', ANY: 'Any',
};

export const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'] as const;
export const TARGET_GENDERS = ['Male', 'Female', 'All Genders'] as const;
export const TARGET_LOCATIONS = [
  'Pan India', 'Metro cities only', 'Tier 1 cities', 'Tier 2 cities',
  'Specific states', 'International',
] as const;
export const INCOME_BRACKETS = ['Budget-conscious', 'Mid-range', 'Premium', 'Luxury'] as const;
export const CAMPAIGNS_PER_MONTH = ['1-2', '3-5', '6-10', '10+', 'Seasonal / As needed'] as const;

export const PREFERRED_PLATFORMS = [
  'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'TWITTER', 'FACEBOOK',
  'LINKEDIN', 'BLOG',
] as const;

export const PLATFORM_LABELS: Record<typeof PREFERRED_PLATFORMS[number], string> = {
  INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', TIKTOK: 'TikTok',
  TWITTER: 'Twitter/X', FACEBOOK: 'Facebook',
  LINKEDIN: 'LinkedIn', BLOG: 'Blog / Written Content',
};

export const CONTENT_TYPES_AGENCY = [
  'REELS', 'LONG_FORM_VIDEO', 'STATIC_POSTS', 'STORIES',
  'BLOG_ARTICLES', 'PODCASTS', 'LIVE_STREAMS', 'PRODUCT_REVIEWS', 'TUTORIALS',
] as const;

export const CONTENT_TYPE_LABELS: Record<typeof CONTENT_TYPES_AGENCY[number], string> = {
  REELS: 'Reels / Short Videos', LONG_FORM_VIDEO: 'Long-form Videos',
  STATIC_POSTS: 'Static Image Posts', STORIES: 'Stories (24hr)',
  BLOG_ARTICLES: 'Blog Articles / Reviews', PODCASTS: 'Podcast Mentions',
  LIVE_STREAMS: 'Live Streams', PRODUCT_REVIEWS: 'Unboxing / Product Reviews',
  TUTORIALS: 'Tutorial / How-to Content',
};

export interface AgencyFormData {
  fullName: string;
  workEmail: string;
  password: string;
  confirmPassword: string;
  phone: string;
  designation: string;
  linkedinUrl?: string;
  brandName: string;
  companyLegalName: string;
  website: string;
  brandLogo?: string;
  industry: string;
  companySize: string;
  yearFounded?: number;
  gstin?: string;
  description: string;
  brandSocials?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
  country: string;
  state: string;
  city: string;
  pinCode?: string;
  targetAgeGroups: string[];
  targetGenders: string[];
  targetLocations: string[];
  targetIncomeBracket?: string;
  targetLanguages: string[];
  preferredPlatforms: string[];
  contentTypesNeeded: string[];
  budgetRange: string;
  paymentTypes: string[];
  paymentTimeline: string;
  campaignsPerMonth?: string;
  preferredFollowerRange: string[];
  preferredCreatorCategories: string[];
  termsOfService: boolean;
  brandGuidelines: boolean;
  paymentTerms: boolean;
  dataAccuracy: boolean;
  creatorCommunicationPolicy: boolean;
  marketingEmails: boolean;
}
