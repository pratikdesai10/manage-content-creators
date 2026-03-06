import { cn } from '../../../../lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

function computeStrength(password: string): number {
  if (password.length < 8) return 0;
  let score = 1;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthInfo(score: number): {
  label: string;
  color: string;
  bgColor: string;
  segments: number;
} {
  if (score <= 1) {
    return { label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-500', segments: 1 };
  }
  if (score <= 3) {
    return { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500', segments: 2 };
  }
  return { label: 'Strong', color: 'text-green-500', bgColor: 'bg-green-500', segments: 3 };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const score = computeStrength(password);
  const { label, color, bgColor, segments } = getStrengthInfo(score);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              segment <= segments ? bgColor : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs mt-1 font-medium', color)}>{label}</p>
    </div>
  );
}
