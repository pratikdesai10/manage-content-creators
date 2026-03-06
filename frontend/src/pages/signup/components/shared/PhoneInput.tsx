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
          error ? 'border-red-300' : 'border-gray-300',
          'focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500',
        )}
      >
        <div className="flex items-center px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-sm text-gray-600 select-none">
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
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
          maxLength={10}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
