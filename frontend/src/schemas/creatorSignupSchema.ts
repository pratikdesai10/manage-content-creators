import { z } from 'zod';

export const creatorStep1Schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50).regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  lastName: z.string().min(2, 'Min 2 characters').max(50).regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  displayName: z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscores only'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Min 10 digits').max(15, 'Max 15 digits'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const socialAccountSchema = z.object({
  platform: z.string().min(1, 'Select a platform'),
  profileUrl: z.string().url('Must be a valid URL'),
  handle: z.string().min(2, 'Min 2 characters').max(50),
  followerCount: z.number({ coerce: true }).min(0, 'Must be 0 or more'),
  accountType: z.string().optional(),
});

export const creatorStep2Schema = z.object({
  socialAccounts: z.array(socialAccountSchema).min(1, 'At least one social account is required'),
});

export const creatorStep3Schema = z.object({
  categories: z.array(z.string()).min(1, 'Select at least 1').max(3, 'Max 3 categories'),
  bio: z.string().min(50, 'Min 50 characters').max(500, 'Max 500 characters'),
  languages: z.array(z.string()).min(1, 'Select at least 1 language'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  contentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export const creatorStep4Schema = z.object({
  rateRange: z.string().min(1, 'Select a rate range'),
  collaborationTypes: z.array(z.string()).min(1, 'Select at least 1'),
  availability: z.string().min(1, 'Select availability'),
  willingToTravel: z.boolean(),
  travelScope: z.string().optional(),
  previousCollaborations: z.preprocess(
    (val) => (val === null || val === undefined || val === '' || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0).optional(),
  ),
  notableBrands: z.array(z.string()),
});

export const creatorStep5Schema = z.object({
  termsOfService: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms of Service' }) }),
  contentGuidelines: z.literal(true, { errorMap: () => ({ message: 'You must accept Content Guidelines' }) }),
  ageConfirmation: z.literal(true, { errorMap: () => ({ message: 'You must confirm your age' }) }),
  dataAccuracy: z.literal(true, { errorMap: () => ({ message: 'You must confirm data accuracy' }) }),
  marketingEmails: z.boolean(),
  whatsappNotifications: z.boolean(),
});

export const creatorStepSchemas = [
  creatorStep1Schema,
  creatorStep2Schema,
  creatorStep3Schema,
  creatorStep4Schema,
  creatorStep5Schema,
];
