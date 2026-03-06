import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './components/ProgressBar';
import { StepNavigator } from './components/StepNavigator';
import { PersonalInfoStep } from './components/creator/PersonalInfoStep';
import { SocialMediaStep } from './components/creator/SocialMediaStep';
import { ProfileCategoriesStep } from './components/creator/ProfileCategoriesStep';
import { CollaborationPrefsStep } from './components/creator/CollaborationPrefsStep';
import { CreatorReviewStep } from './components/creator/CreatorReviewStep';
import { creatorStepSchemas } from '../../schemas/creatorSignupSchema';
import { registerCreator } from '../../api/endpoints';
import type { CreatorFormData, SocialPlatform } from '../../types/creator.types';

const STEP_LABELS = ['Personal', 'Social', 'Profile', 'Collab', 'Review'];

const STEP_FIELDS: (keyof CreatorFormData)[][] = [
  ['firstName', 'lastName', 'displayName', 'email', 'phone', 'password', 'confirmPassword', 'dateOfBirth'],
  ['socialAccounts'],
  ['categories', 'bio', 'languages', 'city', 'state', 'country', 'contentTypes'],
  ['rateRange', 'collaborationTypes', 'availability', 'willingToTravel', 'travelScope', 'previousCollaborations', 'notableBrands'],
  ['termsOfService', 'contentGuidelines', 'ageConfirmation', 'dataAccuracy', 'marketingEmails', 'whatsappNotifications'],
];

export function CreatorSignup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CreatorFormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      socialAccounts: [{ platform: '' as SocialPlatform, profileUrl: '', handle: '', followerCount: 0 }],
      categories: [],
      bio: '',
      languages: [],
      city: '',
      state: '',
      country: 'India',
      contentTypes: [],
      portfolioUrl: '',
      rateRange: '',
      collaborationTypes: [],
      availability: '',
      willingToTravel: false,
      travelScope: '',
      previousCollaborations: undefined,
      notableBrands: [],
      termsOfService: false,
      contentGuidelines: false,
      ageConfirmation: false,
      dataAccuracy: false,
      marketingEmails: true,
      whatsappNotifications: false,
    },
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    const schema = creatorStepSchemas[currentStep];
    const fields = STEP_FIELDS[currentStep];
    const values: Record<string, unknown> = {};
    fields.forEach((f) => {
      values[f] = form.getValues(f);
    });

    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join('.') as keyof CreatorFormData;
        form.setError(path, { message: err.message });
      });
      toast.error(`Please fix ${result.error.errors.length} error(s) below`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (currentStep === 4) {
      setIsSubmitting(true);
      try {
        await registerCreator(form.getValues());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success('Account created successfully!');
        setTimeout(() => navigate('/signup/verify-email'), 2000);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: unknown } } };
        const raw = error.response?.data?.message;
        // Backend HttpExceptionFilter nests validation response: { message: [...], error, statusCode }
        const msg = typeof raw === 'object' && raw !== null && 'message' in raw
          ? (raw as { message: string | string[] }).message
          : raw;
        const text = Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Registration failed';
        toast.error(text);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  };

  const steps = [
    <PersonalInfoStep key="step1" form={form} />,
    <SocialMediaStep key="step2" form={form} />,
    <ProfileCategoriesStep key="step3" form={form} />,
    <CollaborationPrefsStep key="step4" form={form} />,
    <CreatorReviewStep key="step5" form={form} />,
  ];

  // ProgressBar and StepNavigator use 1-based step indexing
  const oneBasedStep = currentStep + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          currentStep={oneBasedStep}
          totalSteps={5}
          stepLabels={STEP_LABELS}
          onStepClick={(step) => {
            setDirection(step < oneBasedStep ? -1 : 1);
            setCurrentStep(step - 1);
          }}
        />
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {steps[currentStep]}
            </motion.div>
          </AnimatePresence>
          <StepNavigator
            currentStep={oneBasedStep}
            totalSteps={5}
            onBack={handleBack}
            onNext={handleNext}
            isSubmitting={isSubmitting}
            submitLabel="Create My Creator Account"
          />
        </div>
      </div>
    </div>
  );
}
