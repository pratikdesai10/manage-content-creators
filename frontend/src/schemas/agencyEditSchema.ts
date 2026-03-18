import { z } from 'zod';

export const agencyEditSchema = z.object({
  // Contact person
  contactPersonName: z.string().min(2).max(100),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(10).max(15).optional().or(z.literal('')),
  designation: z.string().min(2).max(50),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // Brand details
  brandName: z.string().min(2).max(100),
  companyLegalName: z.string().min(2).max(150),
  website: z.string().url('Must be a valid URL'),
  logoUrl: z.string().optional().or(z.literal('')),
  industry: z.string().min(1, 'Select an industry'),
  companySize: z.string().min(1, 'Select company size'),
  yearFounded: z.preprocess(
    (val) => (val === null || val === undefined || val === '' || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(1900).max(new Date().getFullYear()).optional(),
  ),
  gstin: z.string().optional().or(z.literal('')),
  description: z.string().min(50, 'Min 50 characters').max(500),
  brandSocials: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),
  // Location
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pinCode: z.string().optional().or(z.literal('')),
  // Target audience
  targetAgeGroups: z.array(z.string()).min(1, 'Select at least 1'),
  targetGenders: z.array(z.string()).min(1, 'Select at least 1'),
  targetLocations: z.array(z.string()).min(1, 'Select at least 1'),
  targetIncomeBracket: z.string().optional(),
  targetLanguages: z.array(z.string()).min(1, 'Select at least 1'),
  // Campaign preferences
  preferredPlatforms: z.array(z.string()).min(1, 'Select at least 1'),
  contentTypesNeeded: z.array(z.string()).min(1, 'Select at least 1'),
  budgetRange: z.string().min(1, 'Select budget range'),
  paymentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  paymentTimeline: z.string().min(1, 'Select payment timeline'),
  campaignsPerMonth: z.string().optional(),
  preferredFollowerRange: z.array(z.string()).min(1, 'Select at least 1'),
  preferredCreatorCategories: z.array(z.string()).min(1, 'Select at least 1').max(5, 'Max 5'),
});

export type AgencyEditFormData = z.infer<typeof agencyEditSchema>;
