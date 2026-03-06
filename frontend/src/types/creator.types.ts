export const SOCIAL_PLATFORMS = [
  'INSTAGRAM', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'TIKTOK', 'LINKEDIN', 'BLOG',
] as const;
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export const CREATOR_CATEGORIES = [
  'ENTERTAINMENT', 'EDUCATION', 'FINANCE', 'TECHNOLOGY', 'LIFESTYLE',
  'FITNESS', 'TRAVEL', 'FOOD', 'FASHION', 'GAMING', 'MUSIC',
  'PHOTOGRAPHY', 'AI_TOOLS', 'PARENTING', 'PETS', 'SPORTS',
  'COMEDY', 'MOTIVATION', 'DIY', 'AUTOMOTIVE',
] as const;
export type CreatorCategory = typeof CREATOR_CATEGORIES[number];

export const CATEGORY_LABELS: Record<CreatorCategory, string> = {
  ENTERTAINMENT: 'Entertainment', EDUCATION: 'Education', FINANCE: 'Finance & Trading',
  TECHNOLOGY: 'Technology', LIFESTYLE: 'Lifestyle', FITNESS: 'Fitness & Health',
  TRAVEL: 'Travel', FOOD: 'Food & Cooking', FASHION: 'Fashion & Beauty',
  GAMING: 'Gaming', MUSIC: 'Music', PHOTOGRAPHY: 'Photography & Videography',
  AI_TOOLS: 'AI & Tools', PARENTING: 'Parenting & Family', PETS: 'Pets & Animals',
  SPORTS: 'Sports', COMEDY: 'Comedy & Memes', MOTIVATION: 'Motivation & Self-help',
  DIY: 'DIY & Crafts', AUTOMOTIVE: 'Automotive',
};

export const CATEGORY_ICONS: Record<CreatorCategory, string> = {
  ENTERTAINMENT: '🎭', EDUCATION: '📚', FINANCE: '📈', TECHNOLOGY: '💻',
  LIFESTYLE: '✨', FITNESS: '💪', TRAVEL: '✈️', FOOD: '🍳',
  FASHION: '👗', GAMING: '🎮', MUSIC: '🎵', PHOTOGRAPHY: '📷',
  AI_TOOLS: '🤖', PARENTING: '👨‍👩‍👧', PETS: '🐾', SPORTS: '⚽',
  COMEDY: '😂', MOTIVATION: '🧠', DIY: '🛠️', AUTOMOTIVE: '🚗',
};

export const CONTENT_TYPES = [
  'REELS', 'LONG_FORM_VIDEO', 'STATIC_POSTS', 'STORIES',
  'BLOG_ARTICLES', 'PODCASTS', 'LIVE_STREAMS', 'PRODUCT_REVIEWS', 'TUTORIALS',
] as const;

export const CONTENT_TYPE_LABELS: Record<typeof CONTENT_TYPES[number], string> = {
  REELS: 'Reels / Short Videos', LONG_FORM_VIDEO: 'Long-form Videos',
  STATIC_POSTS: 'Static Posts', STORIES: 'Stories',
  BLOG_ARTICLES: 'Blog Articles', PODCASTS: 'Podcasts',
  LIVE_STREAMS: 'Live Streams', PRODUCT_REVIEWS: 'Product Reviews',
  TUTORIALS: 'Tutorials / How-to',
};

export const RATE_RANGES = [
  'RATE_1K_5K', 'RATE_5K_20K', 'RATE_20K_50K', 'RATE_50K_1L',
  'RATE_1L_5L', 'RATE_5L_PLUS', 'OPEN_TO_NEGOTIATE',
] as const;

export const RATE_RANGE_LABELS: Record<typeof RATE_RANGES[number], string> = {
  RATE_1K_5K: '₹1K – ₹5K', RATE_5K_20K: '₹5K – ₹20K',
  RATE_20K_50K: '₹20K – ₹50K', RATE_50K_1L: '₹50K – ₹1L',
  RATE_1L_5L: '₹1L – ₹5L', RATE_5L_PLUS: '₹5L+',
  OPEN_TO_NEGOTIATE: 'Open to negotiate',
};

export const COLLABORATION_TYPES = [
  'PAID_CAMPAIGNS', 'PRODUCT_EXCHANGE', 'AFFILIATE',
  'BRAND_AMBASSADOR', 'EVENT_APPEARANCES', 'HYBRID',
] as const;

export const COLLABORATION_TYPE_LABELS: Record<typeof COLLABORATION_TYPES[number], string> = {
  PAID_CAMPAIGNS: 'Paid Campaigns', PRODUCT_EXCHANGE: 'Product Exchange / Barter',
  AFFILIATE: 'Affiliate / Commission', BRAND_AMBASSADOR: 'Brand Ambassador (Long-term)',
  EVENT_APPEARANCES: 'Event Appearances', HYBRID: 'Hybrid',
};

export const AVAILABILITY_OPTIONS = [
  'IMMEDIATELY', 'ONE_TWO_WEEKS', 'ONE_MONTH', 'NOT_AVAILABLE',
] as const;

export const AVAILABILITY_LABELS: Record<typeof AVAILABILITY_OPTIONS[number], string> = {
  IMMEDIATELY: 'Available immediately', ONE_TWO_WEEKS: 'Available in 1-2 weeks',
  ONE_MONTH: 'Available in 1 month', NOT_AVAILABLE: 'Currently not available',
};

export const TRAVEL_SCOPES = [
  'WITHIN_CITY', 'WITHIN_STATE', 'ANYWHERE_INDIA', 'INTERNATIONAL',
] as const;

export const TRAVEL_SCOPE_LABELS: Record<typeof TRAVEL_SCOPES[number], string> = {
  WITHIN_CITY: 'Within city', WITHIN_STATE: 'Within state',
  ANYWHERE_INDIA: 'Anywhere in India', INTERNATIONAL: 'International',
};

export const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Other',
] as const;

export const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary', 'Prefer not to say',
] as const;

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', FACEBOOK: 'Facebook',
  TWITTER: 'Twitter/X', TIKTOK: 'TikTok', LINKEDIN: 'LinkedIn', BLOG: 'Blog/Website',
};

export interface SocialAccountFormData {
  platform: SocialPlatform | '';
  profileUrl: string;
  handle: string;
  followerCount: number;
  accountType?: string;
}

export interface CreatorFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender?: string;
  profileImageUrl?: string;
  socialAccounts: SocialAccountFormData[];
  categories: CreatorCategory[];
  bio: string;
  languages: string[];
  city: string;
  state: string;
  country: string;
  contentTypes: string[];
  portfolioUrl?: string;
  rateRange: string;
  collaborationTypes: string[];
  availability: string;
  willingToTravel: boolean;
  travelScope?: string;
  previousCollaborations?: number;
  notableBrands: string[];
  termsOfService: boolean;
  contentGuidelines: boolean;
  ageConfirmation: boolean;
  dataAccuracy: boolean;
  marketingEmails: boolean;
  whatsappNotifications: boolean;
}
