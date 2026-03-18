import type { UseFormReturn } from 'react-hook-form';
import { cn } from '../../../../lib/utils';

interface CheckboxItem {
  name: string;
  label: string;
  required: boolean;
}

interface TermsCheckboxGroupProps {
  items: CheckboxItem[];
  form: UseFormReturn<any>;
}

export function TermsCheckboxGroup({ items, form }: TermsCheckboxGroupProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const fieldError = errors[item.name] as { message?: string } | undefined;

        return (
          <div key={item.name}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register(item.name)}
                className={cn(
                  'mt-0.5 h-4 w-4 rounded border-white/10 accent-indigo-500 cursor-pointer',
                  'focus:ring-indigo-500/30',
                )}
              />
              <span className="text-sm text-gray-300 group-hover:text-white">
                {item.label}
                {item.required && (
                  <span className="text-red-400 ml-0.5">*</span>
                )}
              </span>
            </label>
            {fieldError?.message && (
              <p className="ml-7 mt-1 text-sm text-red-400">
                {fieldError.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
