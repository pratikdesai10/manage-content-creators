import {
  PrismaClient,
  UserRole,
  CreatorCategory,
  SocialPlatform,
  ContentType,
  CollaborationType,
  CollaborationStatus,
  Availability,
  TravelScope,
  RateRange,
  IndustryCategory,
  CompanySize,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Seeded pseudo-random number generator (deterministic)
// ═══════════════════════════════════════════════════════════════════════════════
let _seed = 42;
function seededRandom(): number {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => seededRandom() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((seededRandom() * (max - min) + min).toFixed(decimals));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA POOLS
// ═══════════════════════════════════════════════════════════════════════════════
const MALE_FIRST_NAMES = [
  'Aarav',
  'Arjun',
  'Rohan',
  'Vikram',
  'Karan',
  'Siddharth',
  'Aditya',
  'Rahul',
  'Dev',
  'Nikhil',
  'Varun',
  'Harsh',
  'Pranav',
  'Gaurav',
  'Rishi',
  'Sahil',
  'Manish',
  'Ankit',
  'Tarun',
  'Deepak',
  'Yash',
  'Akash',
  'Vishal',
  'Kunal',
  'Rajesh',
  'Suresh',
  'Amit',
  'Mohit',
  'Vivek',
  'Ajay',
  'Sanjay',
  'Naveen',
  'Ramesh',
  'Abhishek',
  'Pankaj',
  'Tushar',
  'Ishaan',
  'Kabir',
  'Lakshya',
  'Om',
  'Reyansh',
  'Shaurya',
  'Dhruv',
  'Arnav',
  'Parth',
  'Vihaan',
  'Krish',
  'Atharv',
  'Rudra',
  'Advait',
];

const FEMALE_FIRST_NAMES = [
  'Priya',
  'Ananya',
  'Sneha',
  'Deepika',
  'Nisha',
  'Meera',
  'Kavya',
  'Divya',
  'Riya',
  'Neha',
  'Pooja',
  'Shruti',
  'Tanvi',
  'Isha',
  'Aisha',
  'Sanya',
  'Trisha',
  'Kritika',
  'Zara',
  'Avni',
  'Aditi',
  'Sakshi',
  'Muskan',
  'Kiara',
  'Manya',
  'Simran',
  'Diya',
  'Palak',
  'Bhavna',
  'Jasmine',
  'Swati',
  'Rashmi',
  'Anjali',
  'Komal',
  'Megha',
  'Nandini',
  'Payal',
  'Sonal',
  'Tara',
  'Urvi',
  'Vidya',
  'Yamini',
  'Jhanvi',
  'Khushi',
  'Lavanya',
  'Mallika',
  'Nimisha',
  'Oorja',
  'Pihu',
  'Ridhi',
];

const LAST_NAMES = [
  'Sharma',
  'Verma',
  'Iyer',
  'Singh',
  'Gupta',
  'Patel',
  'Menon',
  'Deshmukh',
  'Agarwal',
  'Joshi',
  'Reddy',
  'Nair',
  'Mehta',
  'Khan',
  'Kapoor',
  'Bhatia',
  'Choudhary',
  'Pillai',
  'Saxena',
  'Mishra',
  'Banerjee',
  'Mukherjee',
  'Das',
  'Rao',
  'Pandey',
  'Tiwari',
  'Srivastava',
  'Chauhan',
  'Yadav',
  'Thakur',
];

const CITIES: { city: string; state: string }[] = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Gurgaon', state: 'Haryana' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Vizag', state: 'Andhra Pradesh' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Dehradun', state: 'Uttarakhand' },
];

const LANGUAGES_POOL = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Rajasthani',
  'Odia',
  'Assamese',
];

const ALL_CATEGORIES: CreatorCategory[] = [
  CreatorCategory.ENTERTAINMENT,
  CreatorCategory.EDUCATION,
  CreatorCategory.FINANCE,
  CreatorCategory.TECHNOLOGY,
  CreatorCategory.LIFESTYLE,
  CreatorCategory.FITNESS,
  CreatorCategory.TRAVEL,
  CreatorCategory.FOOD,
  CreatorCategory.FASHION,
  CreatorCategory.GAMING,
  CreatorCategory.MUSIC,
  CreatorCategory.PHOTOGRAPHY,
  CreatorCategory.AI_TOOLS,
  CreatorCategory.PARENTING,
  CreatorCategory.PETS,
  CreatorCategory.SPORTS,
  CreatorCategory.COMEDY,
  CreatorCategory.MOTIVATION,
  CreatorCategory.DIY,
  CreatorCategory.AUTOMOTIVE,
];

const ALL_INDUSTRIES: IndustryCategory[] = [
  IndustryCategory.FASHION_APPAREL,
  IndustryCategory.FOOD_BEVERAGE,
  IndustryCategory.TECHNOLOGY_ELECTRONICS,
  IndustryCategory.FINANCE_FINTECH,
  IndustryCategory.TRAVEL_HOSPITALITY,
  IndustryCategory.BEAUTY_PERSONAL_CARE,
  IndustryCategory.FITNESS_SPORTS,
  IndustryCategory.GAMING_ENTERTAINMENT,
  IndustryCategory.EDUCATION_EDTECH,
  IndustryCategory.HEALTH_PHARMA,
  IndustryCategory.AUTOMOTIVE,
  IndustryCategory.REAL_ESTATE,
  IndustryCategory.D2C_ECOMMERCE,
  IndustryCategory.OTHER,
];

const CONTENT_TYPES_ALL = Object.values(ContentType);
const COLLAB_TYPES_ALL = Object.values(CollaborationType);
const RATE_RANGES_ALL = Object.values(RateRange);
const AVAILABILITY_ALL = Object.values(Availability);
const TRAVEL_SCOPES_ALL = Object.values(TravelScope);
const COMPANY_SIZES_ALL = Object.values(CompanySize);
const PLATFORMS_ALL = Object.values(SocialPlatform);

// Bio templates per category
const BIO_TEMPLATES: Record<string, string[]> = {
  ENTERTAINMENT: [
    'Creating entertaining content that makes India laugh and think. Skits, vlogs, and viral moments from {city}.',
    'Entertainment creator from {city}. I make relatable content about everyday Indian life.',
    'Full-time entertainer and content creator. Bringing joy to millions from {city}.',
    'Digital entertainer specializing in sketches, reactions, and pop culture commentary from {city}.',
    'Entertainer and storyteller from {city}. My videos capture the drama of daily Indian life.',
  ],
  EDUCATION: [
    'Making education accessible and fun from {city}. Simplifying complex topics for competitive exam aspirants.',
    'EdTech creator from {city}. Free tutorials on science, math, and coding for Indian students.',
    'Education content creator helping students crack exams. Based in {city}, teaching in Hindi and English.',
    'Passionate educator from {city}. Breaking down UPSC, CAT, and GATE topics into bite-sized videos.',
    'Online tutor and education influencer from {city}. 50K+ students mentored through free content.',
  ],
  FINANCE: [
    'SEBI-registered advisor simplifying personal finance for young Indians. Based in {city}.',
    'Finance educator from {city}. Covering stocks, mutual funds, and tax planning in simple language.',
    'Making money talk simple from {city}. Crypto, investing, and budgeting for millennials.',
    'Personal finance creator from {city}. Helping India invest smarter, one video at a time.',
    'Finance and wealth-building creator from {city}. Ex-banker turned full-time content creator.',
  ],
  TECHNOLOGY: [
    'Tech reviewer and gadget geek from {city}. Honest reviews and benchmark-driven analysis.',
    'Full-time tech creator from {city}. Smartphones, laptops, and everything in between.',
    'Technology enthusiast from {city}. Breaking down the latest tech for the Indian consumer.',
    'Gadget reviewer and tech explainer from {city}. 3+ years of unbiased tech content.',
    'Tech vlogger from {city}. Covering launches, comparisons, and the future of technology in India.',
  ],
  LIFESTYLE: [
    'Lifestyle creator from {city}. Sharing daily routines, home decor, and mindful living tips.',
    'Living my best life in {city} and documenting every bit. Fashion, food, and fun.',
    'Lifestyle and wellness creator from {city}. Content about self-care, journaling, and slow living.',
    'Curating the modern Indian lifestyle from {city}. Shopping hauls, room tours, and day-in-my-life vlogs.',
    'Lifestyle influencer from {city}. Helping you upgrade your everyday with practical tips.',
  ],
  FITNESS: [
    'Certified fitness trainer from {city}. Home workouts and Indian diet plans that actually work.',
    'Fitness content creator from {city}. Transformations, meal preps, and no-equipment routines.',
    'CrossFit enthusiast and nutrition coach based in {city}. Making fitness fun and accessible.',
    'Fitness creator from {city}. Helping busy professionals stay fit with 20-minute workouts.',
    'Strength training and wellness advocate from {city}. Sharing evidence-based fitness content.',
  ],
  TRAVEL: [
    'Adventure traveler documenting offbeat India from {city}. Drone cinematography specialist.',
    'Budget travel creator from {city}. Proving you can explore India without breaking the bank.',
    'Travel vlogger from {city}. From Himalayan treks to hidden beaches, I cover it all.',
    'Solo traveler and storyteller from {city}. Sharing cinematic travel content with practical tips.',
    'Wanderlust-driven creator from {city}. Luxury and budget travel guides across India.',
  ],
  FOOD: [
    'Home chef and food creator from {city}. Easy Indian recipes and street food explorations.',
    'Food blogger from {city}. Restaurant reviews, recipes, and kitchen hacks for foodies.',
    'Bringing traditional Indian cuisine to a modern audience from {city}. Cookbook author.',
    'Food content creator from {city}. Street food tours, recipe videos, and honest restaurant reviews.',
    'Passionate about food and flavors from {city}. Sharing regional specialties and fusion recipes.',
  ],
  FASHION: [
    'Fashion influencer from {city}. Affordable style tips and trend breakdowns for Indian audiences.',
    'Style creator from {city}. Mixing high street and thrift for the modern Indian wardrobe.',
    'Fashion and beauty creator from {city}. OOTD, hauls, and seasonal lookbooks.',
    'Fashion-forward content from {city}. Sustainable fashion advocate and styling expert.',
    'Ethnic and western fusion fashion creator from {city}. Making style accessible for all.',
  ],
  GAMING: [
    'Full-time gamer and streamer from {city}. BGMI, Valorant, and GTA V daily streams.',
    'Esports commentator and gaming content creator from {city}. 15K+ Discord community.',
    'Gaming creator from {city}. Reviews, gameplay, and esports coverage in Hindi.',
    'Pro gamer and content creator from {city}. Competitive BGMI player and streaming personality.',
    'Gaming enthusiast from {city}. PC builds, peripheral reviews, and gameplay highlights.',
  ],
  MUSIC: [
    'Independent musician and music creator from {city}. Original compositions and covers.',
    'Music producer and content creator from {city}. Beatmaking tutorials and song breakdowns.',
    'Singer-songwriter from {city}. Sharing original music, covers, and behind-the-scenes content.',
    'Music creator from {city}. Guitar tutorials, jam sessions, and Bollywood song covers.',
    'Classical-meets-modern music creator from {city}. Fusion tracks and music education.',
  ],
  PHOTOGRAPHY: [
    'Photographer and visual storyteller from {city}. Portraits, landscapes, and street photography.',
    'Photography creator from {city}. Lightroom presets, tutorials, and camera gear reviews.',
    'Visual artist from {city}. Capturing India through the lens, one frame at a time.',
    'Photography educator from {city}. Teaching mobile and DSLR photography to beginners.',
    'Travel and portrait photographer from {city}. Creating cinematic visuals for brands.',
  ],
  AI_TOOLS: [
    'AI and productivity tools creator from {city}. Making cutting-edge tech accessible.',
    'AI enthusiast from {city}. Reviewing the latest AI tools, prompts, and workflows.',
    'Tech creator from {city} focused on AI tools, automation, and the future of work.',
    'AI tools expert from {city}. Tutorials on ChatGPT, Midjourney, and no-code platforms.',
    'Exploring the AI revolution from {city}. Daily tool reviews and productivity hacks.',
  ],
  PARENTING: [
    'Mom blogger and parenting creator from {city}. Real talk about raising kids in India.',
    'Parenting content creator from {city}. Tips on nutrition, education, and mindful parenting.',
    'Dad creator from {city}. Sharing the joys and chaos of Indian parenting life.',
    'Parenting influencer from {city}. Child development tips and family-friendly content.',
    'Modern parenting creator from {city}. Balancing work, kids, and self-care.',
  ],
  PETS: [
    'Pet parent and animal lover from {city}. Content about dog care, training, and adoption.',
    'Pet content creator from {city}. Daily life with my fur babies and pet care tips.',
    'Animal welfare advocate and pet creator from {city}. Adoption stories and care guides.',
    'Pet influencer from {city}. Reviews of pet products, vet tips, and adorable moments.',
    'Cat and dog parent from {city}. Making pet parenting easier for Indian pet owners.',
  ],
  SPORTS: [
    'Sports content creator from {city}. Cricket analysis, fitness routines, and match reactions.',
    'Sports enthusiast from {city}. Covering IPL, football, and Indian athletics.',
    'Sports creator from {city}. Training vlogs, match previews, and athlete interviews.',
    'Cricket and football creator from {city}. Stats, analysis, and fan engagement content.',
    'Aspiring athlete and sports influencer from {city}. Documenting the grind and the glory.',
  ],
  COMEDY: [
    'Stand-up comedian and sketch creator from {city}. Relatable Indian middle-class comedy.',
    'Comedy creator from {city}. Office humor, dating disasters, and family drama sketches.',
    'Making India laugh from {city}. Viral comedy sketches and observational humor.',
    'Comedian and content creator from {city}. Dark humor, satire, and slice-of-life comedy.',
    'Comedy influencer from {city}. Roasts, parodies, and funny takes on trending topics.',
  ],
  MOTIVATION: [
    'Motivational speaker and creator from {city}. Helping young Indians find their purpose.',
    'Self-improvement creator from {city}. Productivity, mindset, and career growth content.',
    'Motivation and mindset creator from {city}. Daily doses of inspiration for hustlers.',
    'Life coach and motivational creator from {city}. Helping professionals level up.',
    'Inspirational content creator from {city}. Stories of resilience, growth, and success.',
  ],
  DIY: [
    'DIY craft creator from {city}. Budget-friendly home decor and upcycling projects.',
    'DIY and home improvement creator from {city}. Transforming spaces on a budget.',
    'Craft enthusiast from {city}. Tutorials on paper crafts, resin art, and sustainable DIY.',
    'DIY creator from {city}. Zero-waste crafts, home hacks, and creative projects.',
    'Maker and DIY influencer from {city}. Woodworking, electronics, and creative builds.',
  ],
  AUTOMOTIVE: [
    'Car and bike reviewer from {city}. Test drives, comparisons, and automotive news.',
    'Automotive content creator from {city}. Covering the Indian auto market in depth.',
    'Petrolhead from {city}. Supercars, road trips, and honest vehicle reviews.',
    'Auto vlogger from {city}. Budget car reviews and maintenance tips for Indian owners.',
    'Motorcycle enthusiast and automotive creator from {city}. Rides, reviews, and mods.',
  ],
};

// Notable Indian brands per category
const NOTABLE_BRANDS: Record<string, string[]> = {
  ENTERTAINMENT: [
    'Netflix India',
    'Amazon Prime',
    'Disney+ Hotstar',
    'Jio Cinema',
    'Sony LIV',
    'MX Player',
  ],
  EDUCATION: [
    'Unacademy',
    "Byju's",
    'Testbook',
    'Physics Wallah',
    'Vedantu',
    'upGrad',
  ],
  FINANCE: ['Groww', 'Zerodha', 'CRED', 'Smallcase', 'Paytm Money', 'Fi Money'],
  TECHNOLOGY: [
    'Samsung India',
    'OnePlus',
    'Realme',
    'Boat',
    'Noise',
    'Xiaomi India',
  ],
  LIFESTYLE: [
    'Myntra',
    'Nykaa',
    'Urban Company',
    'Pepperfry',
    'FabIndia',
    'Chumbak',
  ],
  FITNESS: [
    'Cult.fit',
    'HealthifyMe',
    'MyProtein India',
    'MuscleBlaze',
    'Decathlon India',
    'Nike India',
  ],
  TRAVEL: [
    'MakeMyTrip',
    'Airbnb India',
    'Goibibo',
    'Thomas Cook India',
    'Cleartrip',
    'Yatra',
  ],
  FOOD: ['Swiggy', 'Zomato', 'Haldiram', 'MDH', 'Prestige', 'Pigeon'],
  FASHION: [
    'Myntra',
    'Ajio',
    'H&M India',
    'Zara India',
    'FabAlley',
    'Bewakoof',
  ],
  GAMING: [
    'Asus ROG',
    'Red Bull Gaming',
    'HyperX',
    'Logitech India',
    'SteelSeries',
    'MSI India',
  ],
  MUSIC: [
    'Spotify India',
    'JioSaavn',
    'Gaana',
    'T-Series',
    'Sony Music India',
    'Fender India',
  ],
  PHOTOGRAPHY: [
    'Canon India',
    'Sony Alpha',
    'Nikon India',
    'GoPro India',
    'DJI India',
    'Adobe India',
  ],
  AI_TOOLS: [
    'Notion',
    'Canva',
    'Adobe',
    'Google India',
    'Microsoft India',
    'Zoho',
  ],
  PARENTING: [
    'FirstCry',
    'Mamaearth',
    'The Moms Co',
    'BabyChakra',
    'Pampers India',
    'Johnson & Johnson India',
  ],
  PETS: [
    'Drools',
    'Pedigree India',
    'Heads Up For Tails',
    'Supertails',
    'Wiggles',
    'Royal Canin India',
  ],
  SPORTS: [
    'Puma India',
    'Adidas India',
    'Dream11',
    'MPL',
    'Star Sports',
    'Nike India',
  ],
  COMEDY: [
    'Netflix India',
    'Amazon Prime',
    'Cred',
    'Swiggy',
    'Dunzo',
    'Zomato',
  ],
  MOTIVATION: [
    'Headspace',
    'Kuku FM',
    'Audible India',
    'LinkedIn India',
    'Skillshare',
    'Coursera',
  ],
  DIY: [
    'Asian Paints',
    'Pidilite',
    'Bosch India',
    'Stanley India',
    'Ikea India',
    'HomeCentre',
  ],
  AUTOMOTIVE: [
    'Maruti Suzuki',
    'Hyundai India',
    'Tata Motors',
    'Royal Enfield',
    'Hero MotoCorp',
    'TVS',
  ],
};

// Agency brand name prefixes per industry
const AGENCY_NAME_PARTS: Record<string, string[]> = {
  FASHION_APPAREL: [
    'StyleVerse',
    'TrendCraft',
    'VogueConnect',
    'FashionPulse',
    'ChicMedia',
  ],
  FOOD_BEVERAGE: [
    'FoodNation',
    'TasteHub',
    'FlavorWorks',
    'SpiceDigital',
    'BiteMedia',
  ],
  TECHNOLOGY_ELECTRONICS: [
    'TechWave',
    'ByteForce',
    'PixelBridge',
    'CircuitMedia',
    'CodeCraft',
  ],
  FINANCE_FINTECH: [
    'FinPulse',
    'WealthBridge',
    'MoneyMinds',
    'CashFlow',
    'InvestHub',
  ],
  TRAVEL_HOSPITALITY: [
    'WanderLab',
    'TripCraft',
    'RouteMedia',
    'ExploreHub',
    'NomadDigital',
  ],
  BEAUTY_PERSONAL_CARE: [
    'GlowUp',
    'BeautyVerse',
    'RadiantMedia',
    'BloomAgency',
    'PureGlow',
  ],
  FITNESS_SPORTS: [
    'FitFluence',
    'ActiveMedia',
    'PeakPerform',
    'VitalHub',
    'StrideDigital',
  ],
  GAMING_ENTERTAINMENT: [
    'GameForge',
    'PixelPlay',
    'ArcadeMedia',
    'QuestHub',
    'LevelUp',
  ],
  EDUCATION_EDTECH: [
    'EduRise',
    'LearnBridge',
    'SkillCraft',
    'MindSpark',
    'ClassHub',
  ],
  HEALTH_PHARMA: [
    'HealthFirst',
    'MediConnect',
    'WellnessHub',
    'CareMedia',
    'VitaAgency',
  ],
  AUTOMOTIVE: [
    'AutoPulse',
    'DriveMedia',
    'GearShift',
    'MotorHub',
    'SpeedCraft',
  ],
  REAL_ESTATE: [
    'PropMedia',
    'NestConnect',
    'HomeVerse',
    'SpaceHub',
    'BuildCraft',
  ],
  D2C_ECOMMERCE: [
    'BrandBoost',
    'ShopMedia',
    'CartCraft',
    'D2CHub',
    'ClickConnect',
  ],
  OTHER: [
    'NexGen',
    'HorizonMedia',
    'PivotAgency',
    'SynergyHub',
    'SparkDigital',
  ],
};

const AGENCY_SUFFIXES = ['Media', 'Studios', 'Agency', 'Digital', 'Co.'];

// pravatar.cc verified gender map (manually inspected all 70 images)
const FEMALE_AVATAR_INDICES = [
  5, 9, 10, 16, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35,
  36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
];
const MALE_AVATAR_INDICES = [
  1, 3, 4, 6, 7, 8, 11, 12, 13, 14, 15, 17, 18, 33, 50, 51, 52, 53, 54, 55, 56,
  57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
];

const INDUSTRY_LOGO_COLORS: Record<string, string> = {
  FASHION_APPAREL: 'E879A8',
  FOOD_BEVERAGE: 'F97316',
  TECHNOLOGY_ELECTRONICS: '60A5FA',
  FINANCE_FINTECH: '34D399',
  TRAVEL_HOSPITALITY: '38BDF8',
  BEAUTY_PERSONAL_CARE: 'F0ABFC',
  FITNESS_SPORTS: 'FB923C',
  GAMING_ENTERTAINMENT: 'A78BFA',
  EDUCATION_EDTECH: 'FBBF24',
  HEALTH_PHARMA: '4ADE80',
  AUTOMOTIVE: '94A3B8',
  REAL_ESTATE: '2DD4BF',
  D2C_ECOMMERCE: 'FB7185',
  OTHER: '818CF8',
};

function makePravatarUrl(isFemale: boolean): string {
  const pool = isFemale ? FEMALE_AVATAR_INDICES : MALE_AVATAR_INDICES;
  const idx = pool[Math.floor(seededRandom() * pool.length)];
  return `https://i.pravatar.cc/256?img=${idx}`;
}

function makeLogoUrl(name: string, bg: string): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&size=256&background=${bg}&color=fff&bold=true&rounded=true`;
}
const DESIGNATIONS = [
  'Founder & CEO',
  'Head of Partnerships',
  'VP Brand Partnerships',
  'Managing Director',
  'Creative Director',
  'Head of Creator Relations',
  'Chief Marketing Officer',
  'Partnership Manager',
  'Business Head',
  'Co-Founder',
];

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

let phoneCounter = 9876500000;
function nextPhone(): string {
  phoneCounter++;
  return `+91${phoneCounter}`;
}

const usedDisplayNames = new Set<string>();
function makeDisplayName(
  firstName: string,
  lastName: string,
  category: string,
): string {
  const tag = category.toLowerCase().replace('_', '');
  const candidates = [
    `${firstName.toLowerCase()}_${tag}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${tag}`,
    `${firstName.toLowerCase()}.${tag}`,
    `the_${firstName.toLowerCase()}_${tag}`,
    `${firstName.toLowerCase()}_${tag}_india`,
  ];
  for (const name of candidates) {
    if (!usedDisplayNames.has(name)) {
      usedDisplayNames.add(name);
      return name;
    }
  }
  // Fallback with random suffix
  const fallback = `${firstName.toLowerCase()}_${tag}_${randInt(10, 99)}`;
  usedDisplayNames.add(fallback);
  return fallback;
}

function generateCreatorData(index: number, category: CreatorCategory) {
  const isFemale = seededRandom() > 0.45;
  const firstName = isFemale
    ? pick(FEMALE_FIRST_NAMES)
    : pick(MALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const loc = pick(CITIES);
  const catKey = category as string;
  const displayName = makeDisplayName(firstName, lastName, catKey);
  const emailLocal = displayName.replace(/[^a-z0-9]/g, '');
  const bio = pick(
    BIO_TEMPLATES[catKey] || BIO_TEMPLATES.ENTERTAINMENT,
  ).replace('{city}', loc.city);

  // Secondary category
  const otherCats = ALL_CATEGORIES.filter((c) => c !== category);
  const secondaryCount = randInt(0, 2);
  const categories = [category, ...pickN(otherCats, secondaryCount)];

  const contentTypes = pickN(CONTENT_TYPES_ALL, randInt(2, 4));
  const collabTypes = pickN(COLLAB_TYPES_ALL, randInt(1, 3));
  const rateRange = pick(RATE_RANGES_ALL);
  const availability = pick(AVAILABILITY_ALL);
  const willingToTravel = seededRandom() > 0.35;
  const travelScope = willingToTravel ? pick(TRAVEL_SCOPES_ALL) : null;
  const langs = [
    'Hindi',
    'English',
    ...pickN(LANGUAGES_POOL.slice(2), randInt(0, 2)),
  ];
  const uniqueLangs = Array.from(new Set(langs));
  const prevCollabs = randInt(0, 80);
  const brands = pickN(
    NOTABLE_BRANDS[catKey] || NOTABLE_BRANDS.ENTERTAINMENT,
    randInt(1, 4),
  );
  const hasPortfolio = seededRandom() > 0.5;
  const dob = new Date(randInt(1990, 2003), randInt(0, 11), randInt(1, 28));
  const profileImageUrl = makePravatarUrl(isFemale);

  // Social accounts (2-4)
  const socialCount = randInt(2, 4);
  const platforms = pickN(PLATFORMS_ALL, socialCount);
  const socials = platforms.map((platform) => {
    const followerCount = pick([
      randInt(5000, 15000), // nano
      randInt(15000, 80000), // micro
      randInt(80000, 300000), // mid-tier
      randInt(300000, 800000), // macro
      randInt(800000, 2500000), // mega
    ]);
    return {
      platform,
      handle:
        platform === SocialPlatform.BLOG
          ? `${displayName.replace(/_/g, '')}.com`
          : `@${displayName}`,
      followerCount,
      engagementRate: randFloat(1.5, 12.0),
      avgLikes: Math.round(followerCount * randFloat(0.02, 0.08)),
      growthPercent: randFloat(-2.0, 35.0),
      topContentType: pick([
        'Reels',
        'Long-form video',
        'Short video',
        'Static posts',
        'Stories',
        'Tutorials',
        'Live streams',
      ]),
    };
  });

  return {
    email: `${emailLocal}@collabhub.test`,
    phone: nextPhone(),
    firstName,
    lastName,
    displayName,
    bio,
    city: loc.city,
    state: loc.state,
    categories,
    contentTypes,
    rateRange,
    collabTypes,
    availability,
    willingToTravel,
    travelScope,
    languages: uniqueLangs,
    previousCollaborations: prevCollabs,
    notableBrands: brands,
    profileImageUrl,
    portfolioUrl: hasPortfolio
      ? `https://${displayName.replace(/_/g, '')}.in`
      : null,
    dateOfBirth: dob,
    gender: isFemale ? 'Female' : 'Male',
    socials,
  };
}

const usedBrandNames = new Set<string>();
function generateAgencyData(index: number, industry: IndustryCategory) {
  const indKey = industry as string;
  const nameParts = AGENCY_NAME_PARTS[indKey] || AGENCY_NAME_PARTS.OTHER;

  let brandName: string;
  // Pick a unique brand name
  for (const base of nameParts) {
    const suffix = pick(AGENCY_SUFFIXES);
    const candidate = `${base} ${suffix}`;
    if (!usedBrandNames.has(candidate)) {
      usedBrandNames.add(candidate);
      brandName = candidate;
      break;
    }
  }
  if (!brandName!) {
    brandName = `${pick(nameParts)}${randInt(1, 99)} ${pick(AGENCY_SUFFIXES)}`;
    usedBrandNames.add(brandName);
  }

  const loc = pick(CITIES);
  const isFemale = seededRandom() > 0.5;
  const firstName = isFemale
    ? pick(FEMALE_FIRST_NAMES)
    : pick(MALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const slug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const emailDomain = `${slug}.test`;
  const companySize = pick(COMPANY_SIZES_ALL);
  const yearFounded = randInt(2014, 2024);

  // Relevant creator categories for this industry
  const relatedCategories = pickN(ALL_CATEGORIES, randInt(3, 5));
  const relatedPlatforms = pickN(PLATFORMS_ALL, randInt(2, 4));
  const relatedContentTypes = pickN(CONTENT_TYPES_ALL, randInt(2, 4));

  const logoColor = INDUSTRY_LOGO_COLORS[indKey] || INDUSTRY_LOGO_COLORS.OTHER;
  const initials = brandName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const logoUrl = makeLogoUrl(initials, logoColor);

  const description = `${brandName} is a ${loc.city}-based agency specializing in influencer marketing for the ${indKey.toLowerCase().replace(/_/g, ' ')} sector. We connect brands with authentic content creators to drive engagement and measurable ROI across India.`;

  return {
    email: `contact@${emailDomain}`,
    firstName,
    lastName,
    brandName,
    companyLegalName: `${brandName.replace(/ (Media|Studios|Agency|Digital|Co\.)/, '')} Pvt. Ltd.`,
    industry,
    companySize,
    yearFounded,
    website: `https://${slug}.in`,
    logoUrl,
    description,
    city: loc.city,
    state: loc.state,
    contactPerson: `${firstName} ${lastName}`,
    contactEmail: `${firstName.toLowerCase()}@${emailDomain}`,
    contactPhone: nextPhone(),
    designation: pick(DESIGNATIONS),
    linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    brandSocials: {
      instagram: `https://instagram.com/${slug}`,
      linkedin: `https://linkedin.com/company/${slug}`,
      ...(seededRandom() > 0.4
        ? { twitter: `https://twitter.com/${slug}` }
        : {}),
      ...(seededRandom() > 0.5
        ? { youtube: `https://youtube.com/${slug}` }
        : {}),
    },
    targetAudience: {
      ageGroups: pickN(
        ['16-18', '18-24', '25-34', '35-44', '45-54'],
        randInt(2, 3),
      ),
      genders: pick([['All'], ['Male', 'Female'], ['Female'], ['Male']]),
      locations: pickN(
        [
          'Metro cities',
          'Tier 1 cities',
          'Tier 2 cities',
          'Pan India',
          'Tier 3 cities',
        ],
        randInt(1, 3),
      ),
      languages: pickN(
        [
          'Hindi',
          'English',
          'Tamil',
          'Telugu',
          'Bengali',
          'Kannada',
          'Marathi',
        ],
        randInt(2, 4),
      ),
      targetIncomeBracket: pick([
        'Lower Middle Income',
        'Middle Income',
        'Upper Middle Income',
        'High Income',
      ]),
    },
    campaignPreferences: {
      platforms: relatedPlatforms,
      contentTypes: relatedContentTypes,
      budgetRange: pick([
        'BUDGET_5K_20K',
        'BUDGET_20K_1L',
        'BUDGET_1L_5L',
        'BUDGET_5L_PLUS',
        'VARIES',
      ]),
      paymentTypes: pickN(
        [
          'FIXED',
          'AFFILIATE',
          'PRODUCT_EXCHANGE',
          'HYBRID',
          'PERFORMANCE_BASED',
        ],
        randInt(1, 3),
      ),
      paymentTimeline: pick([
        'UPFRONT',
        'ON_DELIVERY',
        'FIFTEEN_DAYS',
        'THIRTY_DAYS',
        'MILESTONE_BASED',
      ]),
      followerRange: pickN(
        ['NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA'],
        randInt(2, 3),
      ),
      creatorCategories: relatedCategories,
      collaborationFrequency: pick([
        'Weekly',
        'Bi-weekly',
        'Monthly',
        'Quarterly',
      ]),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLLABORATION & MESSAGE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════
const COLLAB_BRANDS = [
  { name: 'Zomato', person: 'Riya Sharma', email: 'riya.sharma@zomato.com' },
  { name: 'Boat', person: 'Arjun Mehta', email: 'arjun@boat-lifestyle.com' },
  { name: 'Mamaearth', person: 'Priya Nair', email: 'influencer@mamaearth.in' },
  { name: 'Myntra', person: 'Sneha Kapoor', email: 'creators@myntra.com' },
  { name: 'PhonePe', person: 'Varun Das', email: 'varun.das@phonepe.com' },
  { name: 'Nykaa', person: 'Anita Verma', email: 'anita@nykaa.com' },
];

const MESSAGE_BRANDS = [
  {
    name: 'Nike India',
    preview:
      'Hi! We loved your recent content and would love to discuss a campaign...',
    threads: [
      {
        sender: 'BRAND',
        text: 'Hi! We loved your recent content and would love to discuss a potential campaign for our new product line.',
      },
      {
        sender: 'CREATOR',
        text: 'Hey! Thanks so much. Would love to hear more about the campaign. What kind of content are you looking for?',
      },
      {
        sender: 'BRAND',
        text: 'We are thinking 2 Reels and 5 Stories over a 2-week window. Budget is around 60K. Would that work?',
      },
      {
        sender: 'CREATOR',
        text: 'That sounds great! Let me check my calendar and get back to you by EOD.',
      },
    ],
  },
  {
    name: 'Nykaa',
    preview:
      'We are launching a new product line and think you would be a great fit...',
    threads: [
      {
        sender: 'BRAND',
        text: 'We are launching a new skincare line next month and think you would be a perfect fit. Interested?',
      },
      {
        sender: 'CREATOR',
        text: 'Hi! Yes, definitely interested. Could you share more details about the deliverables?',
      },
      {
        sender: 'BRAND',
        text: 'We need 1 YouTube review (10+ min), 3 Instagram Reels, and a blog post. Full product kit will be sent.',
      },
    ],
  },
  {
    name: 'Lenskart',
    preview: 'Partnership opportunity for our upcoming collection...',
    threads: [
      {
        sender: 'BRAND',
        text: 'Hello! We have an exciting partnership opportunity for our upcoming summer collection.',
      },
      {
        sender: 'CREATOR',
        text: 'Hi! That sounds fun. What is the timeline looking like?',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('Seeding database with massive dataset...\n');

  const passwordHash = await bcrypt.hash('Test@1234', 10);

  // ── Clean up ──
  await prisma.messageThread.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.socialAccount.deleteMany({});
  await prisma.agencyContact.deleteMany({});
  await prisma.agencyProfile.deleteMany({});
  await prisma.creatorProfile.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Cleared existing data\n');

  // ── Generate 100 creators (5 per category x 20 categories) ──
  console.log('Creating 100 creators (5 per category)...');
  const allCreatorData = [];
  for (let catIdx = 0; catIdx < ALL_CATEGORIES.length; catIdx++) {
    const category = ALL_CATEGORIES[catIdx];
    for (let i = 0; i < 5; i++) {
      allCreatorData.push(generateCreatorData(catIdx * 5 + i, category));
    }
  }

  const creatorProfiles = [];
  for (const c of allCreatorData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash,
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        role: UserRole.CREATOR,
        isVerified: true,
      },
    });

    const profile = await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        firstName: c.firstName,
        lastName: c.lastName,
        displayName: c.displayName,
        dateOfBirth: c.dateOfBirth,
        gender: c.gender,
        bio: c.bio,
        city: c.city,
        state: c.state,
        languages: c.languages,
        categories: c.categories,
        contentTypes: c.contentTypes,
        rateRange: c.rateRange,
        collaborationTypes: c.collabTypes,
        availability: c.availability,
        willingToTravel: c.willingToTravel,
        travelScope: c.travelScope,
        profileImageUrl: c.profileImageUrl,
        previousCollaborations: c.previousCollaborations,
        notableBrands: c.notableBrands,
        portfolioUrl: c.portfolioUrl,
      },
    });

    for (const s of c.socials) {
      await prisma.socialAccount.create({
        data: {
          creatorProfileId: profile.id,
          platform: s.platform,
          handle: s.handle,
          followerCount: s.followerCount,
          engagementRate: s.engagementRate,
          avgLikes: s.avgLikes,
          growthPercent: s.growthPercent,
          topContentType: s.topContentType,
        },
      });
    }

    creatorProfiles.push(profile);
    if (creatorProfiles.length % 20 === 0) {
      console.log(`  ${creatorProfiles.length}/100 creators created...`);
    }
  }
  console.log(`  All 100 creators created.\n`);

  // ── Generate 70 agencies (5 per industry x 14 industries) ──
  console.log('Creating 70 agencies (5 per industry)...');
  const allAgencyData = [];
  for (let indIdx = 0; indIdx < ALL_INDUSTRIES.length; indIdx++) {
    const industry = ALL_INDUSTRIES[indIdx];
    for (let i = 0; i < 5; i++) {
      allAgencyData.push(generateAgencyData(indIdx * 5 + i, industry));
    }
  }

  let agencyCount = 0;
  for (const a of allAgencyData) {
    const user = await prisma.user.create({
      data: {
        email: a.email,
        passwordHash,
        firstName: a.firstName,
        lastName: a.lastName,
        role: UserRole.AGENCY,
        isVerified: true,
      },
    });

    const profile = await prisma.agencyProfile.create({
      data: {
        userId: user.id,
        brandName: a.brandName,
        companyLegalName: a.companyLegalName,
        industry: a.industry,
        companySize: a.companySize,
        yearFounded: a.yearFounded,
        website: a.website,
        logoUrl: a.logoUrl,
        description: a.description,
        city: a.city,
        state: a.state,
        brandSocials: a.brandSocials,
        targetAudience: a.targetAudience,
        campaignPreferences: a.campaignPreferences,
      },
    });

    await prisma.agencyContact.create({
      data: {
        agencyProfileId: profile.id,
        contactPersonName: a.contactPerson,
        contactEmail: a.contactEmail,
        contactPhone: a.contactPhone,
        designation: a.designation,
        linkedinUrl: a.linkedinUrl,
      },
    });

    agencyCount++;
    if (agencyCount % 14 === 0) {
      console.log(`  ${agencyCount}/70 agencies created...`);
    }
  }
  console.log(`  All 70 agencies created.\n`);

  // ── Collaborations for first 10 creators ──
  console.log('Seeding collaborations for first 10 creators...');
  const collabStatuses = [
    CollaborationStatus.COMPLETED,
    CollaborationStatus.ACTIVE,
    CollaborationStatus.COMPLETED,
  ];
  const collabBudgets = [
    '45,000',
    '1,20,000 total',
    'Products worth 3,500',
    '75,000',
    '50,000',
    '30,000',
  ];

  for (const creator of creatorProfiles.slice(0, 10)) {
    const collabCount = randInt(2, 4);
    for (let j = 0; j < collabCount; j++) {
      const brand = COLLAB_BRANDS[j % COLLAB_BRANDS.length];
      await prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandName: brand.name,
          type: pick(COLLAB_TYPES_ALL),
          status: collabStatuses[j % collabStatuses.length],
          createdAt: new Date(
            `2026-0${randInt(1, 3)}-${String(randInt(1, 28)).padStart(2, '0')}`,
          ),
          brief: `Campaign collaboration with ${brand.name} for content creation and brand promotion.`,
          deliverables: pickN(
            [
              '3 Instagram Reels',
              '5 Stories',
              '1 YouTube Short',
              '1 YouTube Review (8+ min)',
              '2 Blog Posts',
              '1 Unboxing Video',
            ],
            randInt(2, 4),
          ),
          timeline: `${pick(['Jan', 'Feb', 'Mar'])} 2026`,
          budget: `INR ${collabBudgets[j % collabBudgets.length]}`,
          contactPerson: brand.person,
          contactEmail: brand.email,
        },
      });
    }
  }
  console.log('  Collaborations seeded for 10 creators.\n');

  // ── Messages & threads for first 10 creators ──
  console.log('Seeding messages for first 10 creators...');
  for (const creator of creatorProfiles.slice(0, 10)) {
    for (const mb of MESSAGE_BRANDS) {
      const msg = await prisma.message.create({
        data: {
          creatorId: creator.id,
          brandName: mb.name,
          preview: mb.preview,
          isRead: seededRandom() > 0.5,
          createdAt: new Date(`2026-03-0${randInt(1, 9)}`),
        },
      });

      const baseTime = new Date('2026-03-06T09:00:00');
      await prisma.messageThread.createMany({
        data: mb.threads.map((t, idx) => ({
          messageId: msg.id,
          sender: t.sender,
          text: t.text,
          sentAt: new Date(baseTime.getTime() + idx * 45 * 60 * 1000),
        })),
      });
    }
  }
  console.log('  Messages seeded for 10 creators.\n');

  // ── Summary ──
  console.log('='.repeat(60));
  console.log('SEED COMPLETE');
  console.log('='.repeat(60));
  console.log(
    `  Creators:        ${creatorProfiles.length} (5 per category x 20 categories)`,
  );
  console.log(
    `  Agencies:        ${agencyCount} (5 per industry x 14 industries)`,
  );
  console.log(`  Collaborations:  seeded for first 10 creators`);
  console.log(`  Messages:        seeded for first 10 creators`);
  console.log('');
  console.log('Login credentials (all users):');
  console.log('  Password: Test@1234');
  console.log('');
  console.log('Sample creator logins:');
  for (const c of allCreatorData.slice(0, 5)) {
    console.log(`  ${c.displayName.padEnd(30)} -> ${c.email}`);
  }
  console.log('  ...');
  console.log('');
  console.log('Sample agency logins:');
  for (const a of allAgencyData.slice(0, 5)) {
    console.log(`  ${a.brandName.padEnd(30)} -> ${a.email}`);
  }
  console.log('  ...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
