import { useState } from 'react';
import { cn } from '../../../../lib/utils';

interface ChipMultiSelectProps {
  items: readonly string[];
  labels?: Record<string, string>;
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  error?: string;
}

export function ChipMultiSelect({
  items,
  labels,
  selected,
  onChange,
  maxSelections,
  error,
}: ChipMultiSelectProps) {
  const [shakeKey, setShakeKey] = useState<number>(0);

  function handleToggle(item: string) {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      if (maxSelections && selected.length >= maxSelections) {
        setShakeKey((prev) => prev + 1);
        return;
      }
      onChange([...selected, item]);
    }
  }

  return (
    <div>
      <div key={shakeKey} className={cn('flex flex-wrap gap-2', shakeKey > 0 && 'animate-shake')}>
        {items.map((item) => {
          const isSelected = selected.includes(item);
          const label = labels?.[item] ?? item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleToggle(item)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/[0.08]',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}

      {/* Inline keyframes for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
