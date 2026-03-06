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
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
            >
              {CATEGORY_ICONS[cat as CreatorCategory]}{' '}
              {CATEGORY_LABELS[cat as CreatorCategory]}
              <button
                type="button"
                onClick={() => handleToggle(cat)}
                className="ml-1 text-purple-400 hover:text-purple-700"
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
                  ? 'bg-purple-50 border-2 border-purple-500'
                  : 'bg-white border border-gray-200 hover:border-purple-300',
                !isSelected &&
                  selected.length >= maxSelections &&
                  'opacity-50 cursor-not-allowed',
              )}
              disabled={!isSelected && selected.length >= maxSelections}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-4 h-4 text-purple-600"
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
              <span className="text-sm font-medium text-gray-700">
                {CATEGORY_LABELS[category]}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
