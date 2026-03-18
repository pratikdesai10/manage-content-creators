import { cn } from '../../../../lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  return (
    <div>
      <div
        className={cn(
          'flex items-center rounded-lg border overflow-hidden transition-colors',
          error ? 'border-red-400' : 'border-white/10',
          'focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30',
        )}
      >
        <div className="flex items-center px-3 py-2.5 bg-white/5 border-r border-white/10 text-sm text-gray-500 select-none">
          <span className="mr-1">🇮🇳</span>
          <span>+91</span>
        </div>
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            if (digits.length <= 10) {
              onChange(digits);
            }
          }}
          placeholder="Enter phone number"
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-white placeholder-gray-500"
          maxLength={10}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}
