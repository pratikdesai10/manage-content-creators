// Backend enum values and their display labels.
// These must match the Prisma schema enums exactly.
// ignore_for_file: constant_identifier_names

// ── Creator enums ──────────────────────────────────────────────────

enum SocialPlatform {
  INSTAGRAM('Instagram'),
  YOUTUBE('YouTube'),
  FACEBOOK('Facebook'),
  TWITTER('Twitter/X'),
  TIKTOK('TikTok'),
  LINKEDIN('LinkedIn'),
  BLOG('Blog / Written Content');

  final String label;
  const SocialPlatform(this.label);
}

enum CreatorCategory {
  ENTERTAINMENT('Entertainment'),
  EDUCATION('Education'),
  FINANCE('Finance & Trading'),
  TECHNOLOGY('Technology'),
  LIFESTYLE('Lifestyle'),
  FITNESS('Fitness & Health'),
  TRAVEL('Travel'),
  FOOD('Food & Cooking'),
  FASHION('Fashion & Beauty'),
  GAMING('Gaming'),
  MUSIC('Music'),
  PHOTOGRAPHY('Photography & Videography'),
  AI_TOOLS('AI & Tools'),
  PARENTING('Parenting & Family'),
  PETS('Pets & Animals'),
  SPORTS('Sports'),
  COMEDY('Comedy & Memes'),
  MOTIVATION('Motivation & Self-help'),
  DIY('DIY & Crafts'),
  AUTOMOTIVE('Automotive');

  final String label;
  const CreatorCategory(this.label);
}

enum ContentType {
  REELS('Reels / Short Videos'),
  LONG_FORM_VIDEO('Long-form Videos'),
  STATIC_POSTS('Static Image Posts'),
  STORIES('Stories (24hr)'),
  BLOG_ARTICLES('Blog Articles / Reviews'),
  PODCASTS('Podcast Mentions'),
  LIVE_STREAMS('Live Streams'),
  PRODUCT_REVIEWS('Unboxing / Product Reviews'),
  TUTORIALS('Tutorial / How-to Content');

  final String label;
  const ContentType(this.label);
}

enum RateRange {
  RATE_1K_5K('\u20b91,000 - \u20b95,000'),
  RATE_5K_20K('\u20b95,000 - \u20b920,000'),
  RATE_20K_50K('\u20b920,000 - \u20b950,000'),
  RATE_50K_1L('\u20b950,000 - \u20b91,00,000'),
  RATE_1L_5L('\u20b91,00,000 - \u20b95,00,000'),
  RATE_5L_PLUS('\u20b95,00,000+'),
  OPEN_TO_NEGOTIATE('Open to Negotiate');

  final String label;
  const RateRange(this.label);
}

enum CollaborationType {
  PAID_CAMPAIGNS('Paid Campaigns'),
  PRODUCT_EXCHANGE('Product Exchange / Barter'),
  AFFILIATE('Affiliate / Commission'),
  BRAND_AMBASSADOR('Long-term Brand Ambassador'),
  EVENT_APPEARANCES('Event Appearances'),
  HYBRID('Hybrid');

  final String label;
  const CollaborationType(this.label);
}

enum Availability {
  IMMEDIATELY('Immediately Available'),
  ONE_TWO_WEEKS('1-2 Weeks'),
  ONE_MONTH('Within a Month'),
  NOT_AVAILABLE('Currently Unavailable');

  final String label;
  const Availability(this.label);
}

enum TravelScope {
  WITHIN_CITY('Within City'),
  WITHIN_STATE('Within State'),
  ANYWHERE_INDIA('Pan India'),
  INTERNATIONAL('International');

  final String label;
  const TravelScope(this.label);
}

// ── Agency enums ───────────────────────────────────────────────────

enum IndustryCategory {
  FASHION_APPAREL('Fashion & Apparel'),
  FOOD_BEVERAGE('Food & Beverage'),
  TECHNOLOGY_ELECTRONICS('Technology & Electronics'),
  FINANCE_FINTECH('Finance & Fintech'),
  TRAVEL_HOSPITALITY('Travel & Hospitality'),
  BEAUTY_PERSONAL_CARE('Beauty & Personal Care'),
  FITNESS_SPORTS('Fitness & Sports'),
  GAMING_ENTERTAINMENT('Gaming & Entertainment'),
  EDUCATION_EDTECH('Education & EdTech'),
  HEALTH_PHARMA('Health & Pharma'),
  AUTOMOTIVE('Automotive'),
  REAL_ESTATE('Real Estate'),
  D2C_ECOMMERCE('D2C / E-commerce'),
  OTHER('Other');

  final String label;
  const IndustryCategory(this.label);
}

enum CompanySize {
  SIZE_1_10('1-10'),
  SIZE_11_50('11-50'),
  SIZE_51_200('51-200'),
  SIZE_201_500('201-500'),
  SIZE_500_PLUS('500+');

  final String label;
  const CompanySize(this.label);
}

enum BudgetRange {
  BUDGET_5K_20K('\u20b95,000 - \u20b920,000 per creator'),
  BUDGET_20K_1L('\u20b920,000 - \u20b91,00,000 per creator'),
  BUDGET_1L_5L('\u20b91,00,000 - \u20b95,00,000 per creator'),
  BUDGET_5L_PLUS('\u20b95,00,000+ per creator'),
  VARIES('Varies by campaign');

  final String label;
  const BudgetRange(this.label);
}

enum PaymentType {
  FIXED('Fixed Payment'),
  AFFILIATE('Affiliate / Commission-based'),
  PRODUCT_EXCHANGE('Product Exchange / Barter'),
  HYBRID('Hybrid (Fixed + Commission)'),
  PERFORMANCE_BASED('Performance-based (CPV/CPE)');

  final String label;
  const PaymentType(this.label);
}

enum PaymentTimeline {
  UPFRONT('Upfront (before content)'),
  ON_DELIVERY('On delivery'),
  FIFTEEN_DAYS('15 days after delivery'),
  THIRTY_DAYS('30 days after delivery'),
  MILESTONE_BASED('Milestone-based');

  final String label;
  const PaymentTimeline(this.label);
}

enum FollowerRange {
  NANO('Nano (1K-10K)'),
  MICRO('Micro (10K-50K)'),
  MID_TIER('Mid-tier (50K-500K)'),
  MACRO('Macro (500K-1M)'),
  MEGA('Mega (1M+)'),
  ANY('Any');

  final String label;
  const FollowerRange(this.label);
}

// ── Audience / location constants (not enums in backend, stored as strings) ──

const kAgeGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

const kTargetGenders = ['Male', 'Female', 'All Genders'];

const kTargetLocations = [
  'Pan India',
  'Metro cities only',
  'Tier 1 cities',
  'Tier 2 cities',
  'Specific states',
  'International',
];

const kLanguages = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Other',
];

const kIncomeBrackets = ['Budget-conscious', 'Mid-range', 'Premium', 'Luxury'];

const kCampaignsPerMonth = [
  '1-2',
  '3-5',
  '6-10',
  '10+',
  'Seasonal / As needed',
];
