import { z } from 'zod';

export const agencyStep1Schema = z.object({
  fullName: z.string().min(2, 'Min 2 characters').max(100),
  workEmail: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  phone: z.string().min(10).max(15),
  designation: z.string().min(2, 'Min 2 characters').max(50),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const agencyStep2Schema = z.object({
  brandName: z.string().min(2).max(100),
  companyLegalName: z.string().min(2).max(150),
  website: z.string().url('Must be a valid URL'),
  brandLogo: z.string().optional(),
  industry: z.string().min(1, 'Select an industry'),
  companySize: z.string().min(1, 'Select company size'),
  yearFounded: z.number({ coerce: true }).min(1900).max(new Date().getFullYear()).optional(),
  gstin: z.string().optional(),
  description: z.string().min(50, 'Min 50 characters').max(500),
  brandSocials: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }),
});

export const agencyStep3Schema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  pinCode: z.string().optional(),
  targetAgeGroups: z.array(z.string()).min(1, 'Select at least 1'),
  targetGenders: z.array(z.string()).min(1, 'Select at least 1'),
  targetLocations: z.array(z.string()).min(1, 'Select at least 1'),
  targetIncomeBracket: z.string().optional(),
  targetLanguages: z.array(z.string()).min(1, 'Select at least 1'),
});

export const agencyStep4Schema = z.object({
  preferredPlatforms: z.array(z.string()).min(1, 'Select at least 1'),
  contentTypesNeeded: z.array(z.string()).min(1, 'Select at least 1'),
  budgetRange: z.string().min(1, 'Select a budget range'),
  paymentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  paymentTimeline: z.string().min(1, 'Select payment timeline'),
  campaignsPerMonth: z.string().optional(),
  preferredFollowerRange: z.array(z.string()).min(1, 'Select at least 1'),
  preferredCreatorCategories: z.array(z.string()).min(1, 'Select at least 1').max(5, 'Max 5'),
});

export const agencyStep5Schema = z.object({
  termsOfService: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  brandGuidelines: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  paymentTerms: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  dataAccuracy: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  creatorCommunicationPolicy: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  marketingEmails: z.boolean(),
});

export const agencyStepSchemas = [
  agencyStep1Schema,
  agencyStep2Schema,
  agencyStep3Schema,
  agencyStep4Schema,
  agencyStep5Schema,
];
