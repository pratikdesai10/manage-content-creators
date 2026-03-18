import { z } from 'zod';

export const creatorEditSchema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50),
  lastName: z.string().min(2, 'Min 2 characters').max(50),
  bio: z.string().min(50, 'Min 50 characters').max(500, 'Max 500 characters'),
  profileImageUrl: z.string().optional().or(z.literal('')),
  socialAccounts: z.array(z.object({
    platform: z.string().min(1, 'Select a platform'),
    profileUrl: z.string().url('Must be a valid URL'),
    handle: z.string().min(2).max(50),
    followerCount: z.number({ coerce: true }).min(0),
    accountType: z.string().optional(),
  })).min(1, 'At least one social account is required'),
  categories: z.array(z.string()).min(1, 'Select at least 1').max(3, 'Max 3 categories'),
  languages: z.array(z.string()).min(1, 'Select at least 1 language'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  contentTypes: z.array(z.string()).min(1, 'Select at least 1'),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
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

export type CreatorEditFormData = z.infer<typeof creatorEditSchema>;
