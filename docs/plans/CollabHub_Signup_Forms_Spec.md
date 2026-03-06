# CollabHub — Signup Forms Specification

> **Platform:** React Frontend (Vite + TypeScript + Tailwind)
> **Aesthetic:** Bright & Playful 3D — Purple (#7C3AED) + Blue (#3B82F6)
> **Form Library:** React Hook Form + Zod validation
> **UI Style:** Multi-step wizard with progress indicator, glassmorphism cards, animated transitions

---

## General Signup UX Guidelines

- Landing page has two clear CTAs: **"I'm a Creator"** and **"I'm a Brand"**
- Each leads to a separate multi-step form wizard
- Progress bar at top showing current step and total steps
- "Save & Continue Later" option at every step
- Smooth slide transitions between steps (left-to-right)
- Mobile-responsive — single column on mobile, two columns on desktop
- Show/hide password toggle on all password fields
- Real-time inline validation (red border + error text below field)
- Success animation (confetti / checkmark) on final submission
- Redirect to email verification page after signup
- All fields marked with `*` are required

---

## FORM 1 — CONTENT CREATOR SIGNUP

**Total Steps: 5**

---

### Step 1 of 5 — Personal Information

> Heading: "Let's get to know you"
> Subtext: "Tell us a bit about yourself to get started"

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| First Name | Text input | Min 2 chars, max 50, letters only | ✅ | |
| Last Name | Text input | Min 2 chars, max 50, letters only | ✅ | |
| Display Name / Username | Text input | Min 3 chars, max 30, alphanumeric + underscores, unique check via API | ✅ | Show availability status in real-time (green check / red X) |
| Email Address | Email input | Valid email format, unique check via API | ✅ | Show "We'll send a verification link" hint |
| Phone Number | Phone input with country code dropdown | Valid phone format, 10-15 digits | ✅ | Default country code to +91 (India) based on user locale |
| Password | Password input | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char | ✅ | Show strength meter (Weak / Medium / Strong) |
| Confirm Password | Password input | Must match password | ✅ | |
| Date of Birth | Date picker | Must be 13+ years old, max 100 years | ✅ | Use day/month/year dropdowns, not a calendar popup. Auto-calculate and display age |
| Gender | Select dropdown | — | Optional | Options: Male, Female, Non-binary, Prefer not to say |
| Profile Photo | Image upload | Max 5MB, JPG/PNG/WEBP only | Optional | Show circular preview with crop tool. Drag-and-drop support |

**Step 1 Additional UX:**
- Password strength meter with color coding (red → yellow → green)
- Username availability check with 500ms debounce on typing
- Email availability check on blur

---

### Step 2 of 5 — Social Media Profiles

> Heading: "Connect your social presence"
> Subtext: "Add at least one social account — this helps brands discover you"
> ⚠️ Minimum 1 social account is MANDATORY to proceed

**Social Media Accounts (Dynamic — Add/Remove):**

Each social account entry has:

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Platform | Select dropdown | Must select one | ✅ | Options: Instagram, YouTube, Facebook, Twitter/X, TikTok, LinkedIn, Blog/Website |
| Profile URL | URL input | Must be valid URL matching the selected platform domain | ✅ | Auto-detect: instagram.com/*, youtube.com/*, etc. Show platform icon next to field |
| Username / Handle | Text input | Min 2 chars, max 50 | ✅ | Auto-extract from URL if possible |
| Follower / Subscriber Count | Number input | Min 0, must be a number | ✅ | Use formatted input (e.g., "12.5K", "1.2M") with raw number stored |
| Account Type | Select | — | Optional | Options: Personal, Business, Creator |

**Dynamic Behavior:**
- "＋ Add Another Social Account" button below the entries
- Trash icon to remove an entry (cannot remove if only 1 remains)
- Validation: at least 1 complete social account entry required
- Show platform-specific icons and colors for each entry card
- Platform dropdown should disable already-added platforms (no duplicates)
- Total follower count auto-calculated and shown as summary badge

**Platform-Specific URL Validation Patterns:**
```
Instagram: https://instagram.com/{username} or https://www.instagram.com/{username}
YouTube:   https://youtube.com/@{handle} or https://www.youtube.com/channel/{id}
Facebook:  https://facebook.com/{page} or https://www.facebook.com/{page}
Twitter/X: https://twitter.com/{handle} or https://x.com/{handle}
TikTok:    https://tiktok.com/@{handle} or https://www.tiktok.com/@{handle}
LinkedIn:  https://linkedin.com/in/{handle}
Blog:      Any valid URL
```

---

### Step 3 of 5 — Creator Profile & Categories

> Heading: "What kind of content do you create?"
> Subtext: "Select your niche — you can choose up to 3 categories"

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Content Categories | Multi-select chips/tags | Min 1, max 3 selections | ✅ | See category list below. Show as clickable pill/chip buttons with icons |
| Bio / About Me | Textarea | Min 50 chars, max 500 chars | ✅ | Character counter at bottom. Placeholder: "Tell brands what makes you unique..." |
| Content Languages | Multi-select chips | Min 1 | ✅ | Options: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Other |
| Location — City | Text input with autocomplete | — | ✅ | Google Places autocomplete or predefined list |
| Location — State | Select dropdown | — | ✅ | Auto-populate based on city |
| Location — Country | Select dropdown | — | ✅ | Default: India |
| Content Type Specialty | Multi-select chips | Min 1, max 5 | ✅ | Options: Reels / Short Videos, Long-form Videos, Static Posts, Stories, Blog Articles, Podcasts, Live Streams, Product Reviews, Tutorials / How-to |
| Portfolio / Sample Work URL | URL input | Valid URL | Optional | "Link to your best work" |

**Content Categories (with icons):**

| Category | Icon Suggestion |
|---|---|
| Entertainment | 🎭 Masks |
| Education | 📚 Books |
| Finance & Trading | 📈 Chart |
| Technology | 💻 Laptop |
| Lifestyle | ✨ Sparkles |
| Fitness & Health | 💪 Flexed arm |
| Travel | ✈️ Airplane |
| Food & Cooking | 🍳 Cooking |
| Fashion & Beauty | 👗 Dress |
| Gaming | 🎮 Controller |
| Music | 🎵 Music note |
| Photography & Videography | 📷 Camera |
| AI & Tools | 🤖 Robot |
| Parenting & Family | 👨‍👩‍👧 Family |
| Pets & Animals | 🐾 Paw |
| Sports | ⚽ Ball |
| Comedy & Memes | 😂 Laughing |
| Motivation & Self-help | 🧠 Brain |
| DIY & Crafts | 🛠️ Tools |
| Automotive | 🚗 Car |

**Category Selection UX:**
- Display as a grid of cards (4 columns desktop, 2 columns mobile)
- Each card has icon + label
- Click to select (purple border + checkmark overlay)
- Shake animation + tooltip if user tries to select more than 3
- Selected categories shown as tags above the grid

---

### Step 4 of 5 — Collaboration Preferences

> Heading: "How do you like to collaborate?"
> Subtext: "This helps brands understand your working style"

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Expected Rate Range | Select dropdown | — | ✅ | Options: ₹1K – ₹5K, ₹5K – ₹20K, ₹20K – ₹50K, ₹50K – ₹1L, ₹1L – ₹5L, ₹5L+, Open to negotiate |
| Preferred Collaboration Type | Multi-select chips | Min 1 | ✅ | Options: Paid Campaigns, Product Exchange / Barter, Affiliate / Commission, Brand Ambassador (Long-term), Event Appearances, Hybrid |
| Availability | Select dropdown | — | ✅ | Options: Available immediately, Available in 1-2 weeks, Available in 1 month, Currently not available |
| Willing to Travel | Toggle switch | — | Optional | Default: No. If Yes, show "How far?" dropdown: Within city, Within state, Anywhere in India, International |
| Previous Brand Collaborations | Number input | Min 0 | Optional | "How many brands have you worked with before?" |
| Notable Brands Worked With | Tag input | Max 10 | Optional | Free-text tag input. "Type brand name and press Enter" |

---

### Step 5 of 5 — Terms & Review

> Heading: "Almost there! Review & accept"
> Subtext: "Please review your information and accept our terms"

**Profile Summary Card:**
- Show a preview card of how their profile will appear to brands
- Display: Photo, Name, Username, Categories (tags), Total followers, Top platform, Bio snippet
- "Edit" link on each section jumping back to that step

**Terms & Conditions:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Terms of Service | Checkbox | Must be checked | ✅ | Text: "I agree to the [Terms of Service](#) and [Privacy Policy](#)" — links open in modal/new tab |
| Content Guidelines | Checkbox | Must be checked | ✅ | Text: "I agree to follow CollabHub's [Content & Community Guidelines](#)" |
| Age Confirmation | Checkbox | Must be checked | ✅ | Text: "I confirm that I am at least 13 years of age" |
| Data Accuracy | Checkbox | Must be checked | ✅ | Text: "I confirm that all information provided is accurate and the social media accounts belong to me" |
| Marketing Emails | Checkbox | — | Optional | Text: "I'd like to receive campaign opportunities and updates via email" — Default: checked |
| WhatsApp Notifications | Checkbox | — | Optional | Text: "I'd like to receive notifications via WhatsApp" — Default: unchecked |

**Terms of Service Summary (shown in collapsible accordion):**

```
1. ACCOUNT OWNERSHIP
   - You must be at least 13 years old to create an account
   - You are responsible for maintaining account security
   - One account per person; no duplicate accounts allowed

2. CONTENT & CONDUCT
   - All linked social media accounts must belong to you
   - Follower/subscriber counts must be accurate and not artificially inflated
   - You agree not to engage in fake engagement, bot followers, or misleading metrics
   - Content created through CollabHub campaigns must comply with applicable advertising disclosure laws (e.g., ASCI guidelines in India)

3. COLLABORATION RULES
   - Once you accept a campaign, you are expected to deliver as agreed
   - Failure to deliver without valid reason may result in account penalties
   - All communication with brands should be conducted through CollabHub platform
   - Payments will be processed through CollabHub's secure payment system

4. INTELLECTUAL PROPERTY
   - You retain ownership of content you create
   - By accepting a campaign, you grant the brand limited usage rights as specified in the campaign agreement
   - CollabHub may use anonymized data for platform improvement

5. PAYMENT TERMS
   - Payments are released after brand approval of deliverables
   - CollabHub charges a platform fee (displayed before campaign acceptance)
   - Disputes are handled through CollabHub's resolution center

6. ACCOUNT TERMINATION
   - CollabHub reserves the right to suspend accounts violating these terms
   - You may delete your account at any time from settings
   - Upon deletion, active campaign obligations must still be fulfilled

7. PRIVACY & DATA
   - Your personal information is handled per our Privacy Policy
   - Profile information (name, categories, social stats) is visible to brands
   - Contact details are shared with brands only after mutual campaign acceptance

8. LIABILITY
   - CollabHub acts as a platform connecting creators and brands
   - CollabHub is not responsible for disputes between creators and brands beyond providing mediation tools
   - CollabHub is not liable for any content posted on third-party social media platforms

9. MODIFICATIONS
   - CollabHub may update these terms with notice
   - Continued use after notice constitutes acceptance
```

**Submit Button:**
- Text: "Create My Creator Account"
- Disabled until all required checkboxes are checked
- Loading state with spinner on click
- On success: confetti animation → redirect to email verification page

---
---

## FORM 2 — BRAND / AGENCY SIGNUP

**Total Steps: 5**

---

### Step 1 of 5 — Account Manager Details

> Heading: "Who's managing this account?"
> Subtext: "We need details of the person handling brand collaborations"

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Full Name | Text input | Min 2 chars, max 100, letters and spaces only | ✅ | |
| Work Email | Email input | Valid email, must not be a free email (gmail, yahoo, hotmail — show warning but allow) | ✅ | Show hint: "Use your company email for faster verification" |
| Password | Password input | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char | ✅ | Strength meter |
| Confirm Password | Password input | Must match | ✅ | |
| Phone Number | Phone input with country code | Valid phone, 10-15 digits | ✅ | Default +91 |
| Designation / Role | Text input | Min 2 chars, max 50 | ✅ | Placeholder: "e.g., Marketing Manager, Brand Head" |
| LinkedIn Profile | URL input | Valid LinkedIn URL | Optional | "Helps creators trust your brand" |

---

### Step 2 of 5 — Brand / Company Details

> Heading: "Tell us about your brand"
> Subtext: "Help creators understand who you are"

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Brand Name | Text input | Min 2 chars, max 100 | ✅ | "The name creators will see" |
| Company Legal Name | Text input | Min 2 chars, max 150 | ✅ | "As registered (used for invoicing)" |
| Company Website | URL input | Valid URL | ✅ | |
| Brand Logo | Image upload | Max 5MB, JPG/PNG/SVG/WEBP | ✅ | Square preview with crop. "Recommended: 400x400px" |
| Industry / Category | Select dropdown | Must select one | ✅ | Options below |
| Company Size | Select dropdown | — | ✅ | Options: 1-10, 11-50, 51-200, 201-500, 500+ |
| Year Founded | Number input | 1900 – current year | Optional | |
| GSTIN | Text input | Valid 15-char GSTIN format | Optional | "Required for Indian tax invoicing" |
| Brand Description | Textarea | Min 50, max 500 chars | ✅ | Character counter. "Describe your brand, products, and mission" |
| Brand Social Media | URL inputs (collapsible) | Valid URLs | Optional | Fields for: Instagram, YouTube, Twitter/X, Facebook, LinkedIn — at least one recommended |

**Industry / Category Options:**

| Category | Sub-hint |
|---|---|
| Fashion & Apparel | Clothing, accessories, jewelry |
| Food & Beverage | Restaurants, FMCG, packaged foods, beverages |
| Technology & Electronics | Gadgets, SaaS, apps, software |
| Finance & Fintech | Banking, trading, insurance, crypto |
| Travel & Hospitality | Hotels, airlines, tourism, travel gear |
| Beauty & Personal Care | Skincare, makeup, grooming, wellness |
| Fitness & Sports | Gym, supplements, activewear, sports gear |
| Gaming & Entertainment | Games, streaming, media, events |
| Education & EdTech | Courses, platforms, coaching, books |
| Health & Pharma | Healthcare, supplements, medical devices |
| Automotive | Cars, bikes, EV, accessories |
| Real Estate | Properties, co-working, interior design |
| D2C / E-commerce | Online-first brands, marketplaces |
| Other | Specify in description |

---

### Step 3 of 5 — Location & Target Audience

> Heading: "Where are you based and who do you target?"
> Subtext: "This helps us match you with the right creators"

**Company Location:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Country | Select dropdown with search | — | ✅ | Default: India |
| State / Region | Select dropdown | — | ✅ | Auto-populate based on country |
| City | Text input with autocomplete | — | ✅ | |
| PIN / ZIP Code | Text input | Valid format for selected country | Optional | |

**Target Audience:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Target Age Group | Multi-select chips | Min 1 | ✅ | Options: 13-17, 18-24, 25-34, 35-44, 45-54, 55+ |
| Target Gender | Multi-select chips | Min 1 | ✅ | Options: Male, Female, All Genders |
| Target Locations | Multi-select with search | Min 1 | ✅ | Options: Pan India, Metro cities only, Tier 1 cities, Tier 2 cities, Specific states (multi-select), International |
| Target Income Bracket | Select dropdown | — | Optional | Options: Budget-conscious, Mid-range, Premium, Luxury |
| Primary Language of Audience | Multi-select chips | Min 1 | ✅ | Same language list as creator form |

---

### Step 4 of 5 — Campaign Preferences

> Heading: "What kind of campaigns do you run?"
> Subtext: "Define your collaboration style so creators know what to expect"

**Content Platform Preferences:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Preferred Platforms | Multi-select chips | Min 1 | ✅ | Options: Instagram, YouTube, TikTok, Twitter/X, Facebook, LinkedIn, Blog / Written Content, Podcast |
| Content Types Needed | Multi-select chips | Min 1 | ✅ | Options: Reels / Short Videos (< 60s), Long-form Videos (> 60s), Static Image Posts, Stories (24hr), Carousel Posts, Blog Articles / Reviews, Live Streams, Podcast Mentions, Unboxing Videos, Tutorial / How-to Content |

**Budget & Payment:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Typical Campaign Budget Range | Select dropdown | — | ✅ | Options: ₹5,000 – ₹20,000 per creator, ₹20,000 – ₹1,00,000 per creator, ₹1,00,000 – ₹5,00,000 per creator, ₹5,00,000+ per creator, Varies by campaign |
| Payment Type | Multi-select chips | Min 1 | ✅ | Options: Fixed Payment, Affiliate / Commission-based, Product Exchange / Barter, Hybrid (Fixed + Commission), Performance-based (CPV/CPE) |
| Payment Timeline | Select dropdown | — | ✅ | Options: Upfront (before content), On delivery, 15 days after delivery, 30 days after delivery, Milestone-based |

**Campaign Frequency:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Campaigns Per Month (approx.) | Select dropdown | — | Optional | Options: 1-2, 3-5, 6-10, 10+, Seasonal / As needed |
| Preferred Creator Follower Range | Multi-select chips | Min 1 | ✅ | Options: Nano (1K-10K), Micro (10K-50K), Mid-tier (50K-500K), Macro (500K-1M), Mega (1M+), Any |
| Preferred Creator Categories | Multi-select chips | Min 1, max 5 | ✅ | Same category list as creator form |

---

### Step 5 of 5 — Terms & Review

> Heading: "Review and launch your brand on CollabHub"
> Subtext: "Verify your details and accept our terms to get started"

**Brand Profile Preview Card:**
- Display: Logo, Brand Name, Industry, Location, Target Audience summary, Budget range, Preferred platforms
- "Edit" link on each section

**Terms & Conditions:**

| Field | Type | Validation | Required | Notes |
|---|---|---|---|---|
| Terms of Service | Checkbox | Must be checked | ✅ | Text: "I agree to the [Terms of Service](#) and [Privacy Policy](#)" |
| Brand Guidelines | Checkbox | Must be checked | ✅ | Text: "I agree to follow CollabHub's [Brand Collaboration Guidelines](#)" |
| Payment Terms | Checkbox | Must be checked | ✅ | Text: "I understand and agree to CollabHub's [Payment & Refund Policy](#)" |
| Data Accuracy | Checkbox | Must be checked | ✅ | Text: "I confirm that I am authorized to represent this brand/company and that all information provided is accurate" |
| Creator Communication Policy | Checkbox | Must be checked | ✅ | Text: "I agree to communicate with creators respectfully and through the CollabHub platform" |
| Marketing Emails | Checkbox | — | Optional | Text: "Send me updates on new creators, platform features, and tips" — Default: checked |

**Terms of Service Summary for Brands (collapsible accordion):**

```
1. ACCOUNT & AUTHORIZATION
   - You must be authorized to represent the brand/company
   - One brand account per company; multiple team members can be added later
   - Account credentials must not be shared outside your organization

2. CAMPAIGN RULES
   - Campaign briefs must be accurate and clearly describe deliverables
   - You must not ask creators to post misleading or deceptive content
   - All campaigns must comply with ASCI (Advertising Standards Council
     of India) guidelines and applicable advertising laws
   - Campaign modifications after creator acceptance require mutual agreement

3. CREATOR RELATIONS
   - All communication with creators must be conducted via CollabHub
   - Attempting to bypass CollabHub to work directly with discovered
     creators is a violation of these terms
   - Respectful and professional conduct is mandatory
   - Discrimination based on gender, religion, caste, or ethnicity
     is strictly prohibited

4. PAYMENT OBLIGATIONS
   - Campaign budgets must be deposited in escrow before campaign launch
   - Payments are released to creators upon brand approval of deliverables
   - If no response within 7 days of delivery, payment auto-releases
   - Disputes must be raised within 48 hours of content delivery
   - CollabHub charges a platform fee (displayed at campaign creation)
   - Refunds are subject to CollabHub's Refund Policy

5. CONTENT RIGHTS & USAGE
   - Content rights are as specified in individual campaign agreements
   - Default usage: brand's social media and website for 12 months
   - Extended usage (ads, print, TV) must be explicitly agreed upon
     and may incur additional fees
   - Creator retains right to display the content in their portfolio

6. INTELLECTUAL PROPERTY
   - Brand logos, assets, and materials shared with creators remain
     brand property
   - You grant creators limited license to use brand materials
     solely for campaign deliverables
   - Misuse of creator content beyond agreed terms is a violation

7. DATA & PRIVACY
   - Creator contact details are shared only after mutual campaign acceptance
   - You must not use creator data for purposes outside CollabHub campaigns
   - You must not share creator data with third parties
   - Brand profile information is visible to all creators on the platform

8. ACCOUNT SUSPENSION & TERMINATION
   - CollabHub reserves the right to suspend accounts for violations
   - Late payments, harassment, or terms violations may result in
     permanent ban
   - Active campaigns must be fulfilled or properly cancelled before
     account deletion
   - Escrowed funds for active campaigns are handled per Refund Policy

9. PLATFORM LIMITATIONS
   - CollabHub is a marketplace platform, not a party to brand-creator
     agreements
   - CollabHub provides mediation tools but does not guarantee outcomes
   - CollabHub is not responsible for content performance or ROI
   - Platform availability is provided on an "as-is" basis

10. MODIFICATIONS
    - These terms may be updated with 30-day notice
    - Continued use constitutes acceptance of updated terms
    - Material changes will be communicated via email
```

**Submit Button:**
- Text: "Launch My Brand on CollabHub"
- Disabled until all required checkboxes are checked
- Loading spinner on click
- On success: animation → redirect to email verification → then brand dashboard

---
---

## SHARED UX SPECIFICATIONS

---

### Progress Bar Component

```
Visual: Horizontal step indicator at top of form
Style: Connected dots with labels

Step indicators:
  ○ ——— ○ ——— ○ ——— ○ ——— ○
  1     2     3     4     5

States:
  - Completed: Filled purple circle with white checkmark
  - Current: Larger pulsing blue circle with step number
  - Upcoming: Gray outlined circle with step number
  - Connector line: Purple (completed) or gray (upcoming)

Click behavior: Can click completed steps to go back
               Cannot skip ahead to uncompleted steps
```

---

### Form Navigation

```
Bottom of each step:

Step 1:
  [                              ] [Next →]

Steps 2-4:
  [← Back] [Save Draft] [Next →]

Step 5:
  [← Back] [Save Draft] [Create Account ✓]

Button styles:
  Next / Submit: Solid purple (#7C3AED), white text, rounded-xl
  Back: Outlined purple, transparent bg, rounded-xl
  Save Draft: Text-only, gray, no border
```

---

### Validation Behavior

```
Real-time validation:
  - Validate on blur (when user leaves a field)
  - Show error immediately below the field in red text
  - Red border on the input field
  - Error icon (!) inside the field on the right

Step validation:
  - "Next" button click validates all fields in current step
  - Scroll to first error field with shake animation
  - Error summary toast at top: "Please fix 3 errors below"

Success indicators:
  - Green border + checkmark on valid fields
  - Green checkmark on completed steps in progress bar
```

---

### Responsive Layout

```
Desktop (>1024px):
  - Two-column layout for most steps
  - Left column: illustration / info panel
  - Right column: form fields
  - Max width: 1200px centered

Tablet (768-1024px):
  - Single column, wider form
  - Illustration hidden or shown above form
  - Full width with padding

Mobile (<768px):
  - Single column, full width
  - Stacked fields
  - Floating bottom bar for navigation buttons
  - Collapsible sections for long steps
```

---

### Animations & Micro-interactions

```
Step transitions:
  - Slide-left animation when going forward
  - Slide-right animation when going back
  - 300ms ease-in-out

Field interactions:
  - Label floats above on focus (floating label pattern)
  - Subtle scale(1.02) on input focus
  - Chip/tag selection: pop animation with scale bounce

Progress bar:
  - Line fills with purple gradient animation
  - Completed dot gets checkmark with pop animation

Submit:
  - Button transforms to loading spinner
  - On success: spinner transforms to green checkmark
  - Confetti burst animation from center
  - Auto-redirect after 2 seconds
```

---

### Email Verification Page (After Both Signups)

```
Page content:
  - Large 3D email illustration (from asset prompts doc)
  - Heading: "Check your inbox!"
  - Subtext: "We've sent a verification link to {email}"
  - "Resend Email" button (disabled for 60s with countdown)
  - "Change Email" link
  - "Open Gmail" / "Open Outlook" quick links based on email domain
  - Auto-detect verification (poll API every 5s or use WebSocket)
  - On verified: green checkmark animation → redirect to dashboard
```

---

## API Integration Notes

```
Creator Signup Payload:

POST /auth/signup/creator
{
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "email": "string",
  "phone": { "countryCode": "+91", "number": "string" },
  "password": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "string | null",
  "profilePhoto": "file | null",
  "socialAccounts": [
    {
      "platform": "INSTAGRAM | YOUTUBE | FACEBOOK | TWITTER | TIKTOK | LINKEDIN | BLOG",
      "profileUrl": "string",
      "username": "string",
      "followerCount": "number",
      "accountType": "string | null"
    }
  ],
  "categories": ["string"],
  "bio": "string",
  "languages": ["string"],
  "location": { "city": "string", "state": "string", "country": "string" },
  "contentTypes": ["string"],
  "portfolioUrl": "string | null",
  "rateRange": "string",
  "collaborationTypes": ["string"],
  "availability": "string",
  "willingToTravel": "boolean",
  "travelScope": "string | null",
  "previousCollaborations": "number | null",
  "notableBrands": ["string"],
  "marketingEmails": "boolean",
  "whatsappNotifications": "boolean"
}


Agency Signup Payload:

POST /auth/signup/agency
{
  "fullName": "string",
  "workEmail": "string",
  "password": "string",
  "phone": { "countryCode": "+91", "number": "string" },
  "designation": "string",
  "linkedinUrl": "string | null",
  "brandName": "string",
  "companyLegalName": "string",
  "website": "string",
  "brandLogo": "file",
  "industry": "string",
  "companySize": "string",
  "yearFounded": "number | null",
  "gstin": "string | null",
  "description": "string",
  "brandSocials": {
    "instagram": "string | null",
    "youtube": "string | null",
    "twitter": "string | null",
    "facebook": "string | null",
    "linkedin": "string | null"
  },
  "location": {
    "country": "string",
    "state": "string",
    "city": "string",
    "pinCode": "string | null"
  },
  "targetAudience": {
    "ageGroups": ["string"],
    "genders": ["string"],
    "locations": ["string"],
    "incomeBracket": "string | null",
    "languages": ["string"]
  },
  "campaignPreferences": {
    "platforms": ["string"],
    "contentTypes": ["string"],
    "budgetRange": "string",
    "paymentTypes": ["string"],
    "paymentTimeline": "string",
    "campaignsPerMonth": "string | null",
    "preferredFollowerRange": ["string"],
    "preferredCreatorCategories": ["string"]
  },
  "marketingEmails": "boolean"
}
```

---

## File & Folder Structure (React)

```
src/
├── pages/
│   └── signup/
│       ├── CreatorSignup.tsx          (main wizard wrapper)
│       ├── AgencySignup.tsx           (main wizard wrapper)
│       ├── EmailVerification.tsx
│       └── components/
│           ├── ProgressBar.tsx
│           ├── StepNavigator.tsx       (Back/Next/Submit buttons)
│           ├── creator/
│           │   ├── PersonalInfoStep.tsx
│           │   ├── SocialMediaStep.tsx
│           │   ├── ProfileCategoriesStep.tsx
│           │   ├── CollaborationPrefsStep.tsx
│           │   └── CreatorReviewStep.tsx
│           ├── agency/
│           │   ├── AccountManagerStep.tsx
│           │   ├── BrandDetailsStep.tsx
│           │   ├── LocationAudienceStep.tsx
│           │   ├── CampaignPrefsStep.tsx
│           │   └── AgencyReviewStep.tsx
│           └── shared/
│               ├── SocialAccountEntry.tsx
│               ├── CategorySelector.tsx
│               ├── ChipMultiSelect.tsx
│               ├── ImageUpload.tsx
│               ├── PhoneInput.tsx
│               ├── PasswordStrengthMeter.tsx
│               ├── TermsAccordion.tsx
│               └── TermsCheckboxGroup.tsx
├── schemas/
│   ├── creatorSignupSchema.ts   (Zod validation schemas per step)
│   └── agencySignupSchema.ts    (Zod validation schemas per step)
├── api/
│   ├── authApi.ts               (signup, login, verify email endpoints)
│   └── validationApi.ts         (check username, check email availability)
└── types/
    ├── creator.types.ts
    └── agency.types.ts
```

---

*Generated for CollabHub — Creator-Brand Collaboration Platform*
