import { cn } from '../../../../lib/utils';
import {
  CREATOR_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type CreatorCategory,
} from '../../../../types/creator.types';

interface CategorySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  error?: string;
}

export function CategorySelector({
  selected,
  onChange,
  maxSelections = 3,
  error,
}: CategorySelectorProps) {
  function handleToggle(category: string) {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      if (selected.length >= maxSelections) return;
      onChange([...selected, category]);
    }
  }

  return (
    <div>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-sm font-medium"
            >
              {CATEGORY_ICONS[cat as CreatorCategory]}{' '}
              {CATEGORY_LABELS[cat as CreatorCategory]}
              <button
                type="button"
                onClick={() => handleToggle(cat)}
                className="ml-1 text-indigo-400 hover:text-indigo-300"
                aria-label={`Remove ${CATEGORY_LABELS[cat as CreatorCategory]}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CREATOR_CATEGORIES.map((category) => {
          const isSelected = selected.includes(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => handleToggle(category)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 text-center',
                isSelected
                  ? 'bg-indigo-500/20 border-2 border-indigo-500/40'
                  : 'bg-white/5 border border-white/10 hover:bg-white/[0.08]',
                !isSelected &&
                  selected.length >= maxSelections &&
                  'opacity-50 cursor-not-allowed',
              )}
              disabled={!isSelected && selected.length >= maxSelections}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-4 h-4 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <span className="text-2xl mb-1">{CATEGORY_ICONS[category]}</span>
              <span className="text-sm font-medium text-gray-300">
                {CATEGORY_LABELS[category]}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
