import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './components/ProgressBar';
import { StepNavigator } from './components/StepNavigator';
import { AccountManagerStep } from './components/agency/AccountManagerStep';
import { BrandDetailsStep } from './components/agency/BrandDetailsStep';
import { LocationAudienceStep } from './components/agency/LocationAudienceStep';
import { CampaignPrefsStep } from './components/agency/CampaignPrefsStep';
import { AgencyReviewStep } from './components/agency/AgencyReviewStep';
import { agencyStepSchemas } from '../../schemas/agencySignupSchema';
import { registerAgency } from '../../api/endpoints';
import type { AgencyFormData } from '../../types/agency.types';

const STEP_LABELS = ['Account', 'Brand', 'Audience', 'Campaigns', 'Review'];

const STEP_FIELDS: (keyof AgencyFormData)[][] = [
  ['fullName', 'workEmail', 'password', 'confirmPassword', 'phone', 'designation'],
  ['brandName', 'companyLegalName', 'website', 'industry', 'companySize', 'description', 'brandSocials'],
  ['country', 'state', 'city', 'targetAgeGroups', 'targetGenders', 'targetLocations', 'targetLanguages'],
  ['preferredPlatforms', 'contentTypesNeeded', 'budgetRange', 'paymentTypes', 'paymentTimeline', 'preferredFollowerRange', 'preferredCreatorCategories'],
  ['termsOfService', 'brandGuidelines', 'paymentTerms', 'dataAccuracy', 'creatorCommunicationPolicy', 'marketingEmails'],
];

export function AgencySignup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<AgencyFormData>({
    mode: 'onBlur',
    defaultValues: {
      fullName: '', workEmail: '', password: '', confirmPassword: '', phone: '',
      designation: '', linkedinUrl: '',
      brandName: '', companyLegalName: '', website: '', brandLogo: '',
      industry: '', companySize: '', yearFounded: undefined, gstin: '',
      description: '',
      brandSocials: { instagram: '', youtube: '', twitter: '', facebook: '', linkedin: '' },
      country: 'India', state: '', city: '', pinCode: '',
      targetAgeGroups: [], targetGenders: [], targetLocations: [],
      targetIncomeBracket: '', targetLanguages: [],
      preferredPlatforms: [], contentTypesNeeded: [], budgetRange: '',
      paymentTypes: [], paymentTimeline: '', campaignsPerMonth: '',
      preferredFollowerRange: [], preferredCreatorCategories: [],
      termsOfService: false, brandGuidelines: false, paymentTerms: false,
      dataAccuracy: false, creatorCommunicationPolicy: false, marketingEmails: true,
    },
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    const schema = agencyStepSchemas[currentStep];
    const fields = STEP_FIELDS[currentStep];
    const values: Record<string, unknown> = {};
    fields.forEach((f) => {
      values[f] = form.getValues(f);
    });

    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join('.') as keyof AgencyFormData;
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
        await registerAgency(form.getValues());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success('Brand account created successfully!');
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
    <AccountManagerStep key="step1" form={form} />,
    <BrandDetailsStep key="step2" form={form} />,
    <LocationAudienceStep key="step3" form={form} />,
    <CampaignPrefsStep key="step4" form={form} />,
    <AgencyReviewStep key="step5" form={form} />,
  ];

  const oneBasedStep = currentStep + 1;

  return (
    <div className="min-h-screen py-8 px-4">
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
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
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
            submitLabel="Launch My Brand on CollabHub"
          />
        </div>
      </div>
    </div>
  );
}
